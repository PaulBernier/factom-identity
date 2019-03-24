// References:
// https://github.com/FactomProject/FactomDocs/blob/FD-849_PublishNewIdentitySpec/ApplicationIdentity.md
// https://github.com/FactomProject/factom/blob/FD-732_release_2.2.15/identity.go#L72

const Joi = require('joi').extend(require('joi-factom'));
const sign = require('tweetnacl/nacl-fast').sign;
const { isValidPublicIdentityKey, extractCryptoMaterial } = require('./key-helpers');

const INITIAL_KEYS_SCHEMA = Joi.object().keys({
    version: Joi.number().valid(1).required(),
    keys: Joi.array().min(1).unique().items(Joi.factom().identityKey('public')).required(),
});

// In memory identity cache
const IDENTITY_CACHE = {};

async function getActiveKeysAtHeight(cli, identityChainId, blockHeight) {
    const cachedData = getCachedData(identityChainId);

    if (cachedData.length > 0) {
        const latestDataAvailable = cachedData[cachedData.length - 1];
        // If the data is requested for an height lower than what was alreay parsed
        // it means we only need to search for it in the cached data
        if (blockHeight <= latestDataAvailable.height) {
            for (let i = cachedData.length - 1; i >= 0; --i) {
                if (cachedData[i].height <= blockHeight) {
                    return cachedData[i].activeKeys;
                }
            }
        } else {
            // Otherwise fetch just the slice of entries missing
            const entries = await getEntries(cli, identityChainId, blockHeight, latestDataAvailable.height);

            let activeKeys = [...latestDataAvailable.activeKeys];
            const allKeys = new Set(latestDataAvailable.allKeys);

            return applyKeyRotations(identityChainId, activeKeys, allKeys, entries, cachedData);
        }
    } else {
        const entries = await getEntries(cli, identityChainId, blockHeight);
        
        if (entries.length === 0) {
            throw new Error(`Invalid identity chain [${identityChainId}] or the chain didn't exist at height [${blockHeight}]`);
        }

        const firstEntry = entries.shift();
        let activeKeys = getInitialKeys(firstEntry);
        const allKeys = new Set(activeKeys);

        cachedData.push({
            height: firstEntry.blockContext.directoryBlockHeight,
            activeKeys: [...activeKeys],
            allKeys: new Set(allKeys)
        });

        return applyKeyRotations(identityChainId, activeKeys, allKeys, entries, cachedData);
    }
}

function getCachedData(identityChainId) {
    if (!Array.isArray(IDENTITY_CACHE[identityChainId])) {
        IDENTITY_CACHE[identityChainId] = [];
    }
    return IDENTITY_CACHE[identityChainId];
}

function applyKeyRotations(chainId, activeKeys, allKeys, entries, cachedData) {
    for (let i = 0; i < entries.length; ++i) {
        const entry = entries[i];

        if (entry.extIds.length === 5 && entry.extIds[0].toString() === 'ReplaceKey') {
            activeKeys = getUpdatedActiveKeys(chainId, activeKeys, allKeys, entry);
            activeKeys.forEach(k => allKeys.add(k));
        }

        // Cache data for that block height
        if (i === entries.length - 1 ||
            entry.blockContext.directoryBlockHeight !== entries[i + 1].blockContext.directoryBlockHeight) {

            cachedData.push({
                height: entry.blockContext.directoryBlockHeight,
                activeKeys: [...activeKeys],
                allKeys: new Set(allKeys)
            });
        }
    }

    return activeKeys;
}

function getUpdatedActiveKeys(chainId, activeKeys, allKeys, entry) {
    const oldKey = entry.extIds[1].toString();

    // 1. Old key must be currently active
    const oldKeyIndex = activeKeys.indexOf(oldKey);
    if (oldKeyIndex === -1) {
        return activeKeys;
    }

    // 2. New key must have never been active
    const newKey = entry.extIds[2].toString();
    if (allKeys.has(newKey)) {
        return activeKeys;
    }

    // 3. Signer key must be currently active and of the same or higher priority than the old key
    const signingKey = entry.extIds[4].toString();
    const signingKeyIndex = activeKeys.indexOf(signingKey);
    if (signingKeyIndex === -1 || signingKeyIndex > oldKeyIndex) {
        return activeKeys;
    }

    // 4. New key must be a valid public identity key
    if (!isValidPublicIdentityKey(newKey)) {
        return activeKeys;
    }

    // 5. Signature must be correct
    const signedData = Buffer.from(chainId + oldKey + newKey);
    const signature = entry.extIds[3];
    if (signature.length !== 64 || !sign.detached.verify(signedData, signature, extractCryptoMaterial(signingKey))) {
        return activeKeys;
    }

    const newActiveKeys = [...activeKeys];
    newActiveKeys[oldKeyIndex] = newKey;

    return newActiveKeys;
}

function getInitialKeys(entry) {
    if (entry.extIds[0].toString() !== 'IdentityChain') {
        throw new Error(`Invalid first entry ${entry.hash()}`);
    }

    try {
        // Validate the content is a valid JSON following the format
        const content = JSON.parse(entry.content.toString());
        Joi.assert(content, INITIAL_KEYS_SCHEMA);
        return content.keys;
    } catch (e) {
        throw new Error(`Invalid first entry ${entry.hash()}: ${e.message}`);
    }
}

// TODO: upperBoundHeight is more harmful than beneficial when caching is implemented?
async function getEntries(cli, identityChainId, upperBoundHeight, lowerBoundHeight = -1) {
    const entries = [];
    await cli.rewindChainWhile(identityChainId, (entry) => entry.blockContext.directoryBlockHeight > lowerBoundHeight, function (entry) {
        if (entry.blockContext.directoryBlockHeight <= upperBoundHeight && basicValidation(entry)) {
            entries.push(entry);
        }
    });

    return entries.reverse();
}

function basicValidation(e) {
    if (e.extIds.length === 0) {
        return false;
    }
    const firstExtId = e.extIds[0].toString();
    return firstExtId === 'ReplaceKey' || firstExtId === 'IdentityChain';
}

module.exports = {
    getActiveKeysAtHeight
};