// References:
// https://github.com/FactomProject/FactomDocs/blob/FD-849_PublishNewIdentitySpec/ApplicationIdentity.md
// https://github.com/FactomProject/factom/blob/FD-732_release_2.2.15/identity.go#L72

const Joi = require('@hapi/joi');
const sign = require('tweetnacl/nacl-fast').sign;
const { isValidPublicIdentityKey, extractCryptoMaterial } = require('./key-helpers');

const identityJoi = Joi.extend(joi => {
    return {
        type: 'identity',
        base: joi.string(),
        messages: {
            'identity.public': '"{{#label}}" is not a valid public identity key'
        },
        rules: {
            public: {
                method() {
                    return this.$_addRule({ name: 'public' });
                },
                validate(value, helpers, args, options) {
                    if (isValidPublicIdentityKey(value)) {
                        return value;
                    }

                    return helpers.error('identity.public');
                }
            }
        }
    };
});

const INITIAL_KEYS_SCHEMA = Joi.object().keys({
    version: Joi.number()
        .valid(1)
        .required(),
    keys: Joi.array()
        .min(1)
        .unique()
        .items(identityJoi.identity().public())
        .required()
});

const CACHE_SCHEMA = Joi.object().keys({
    keys: Joi.object().required(),
    names: Joi.object().required()
});

class IdentityInformationRetriever {
    constructor(cli, opts = {}) {
        this.cli = cli;
        this.save = opts.save || (async () => {});

        if (opts.initialCacheData) {
            Joi.assert(opts.initialCacheData, CACHE_SCHEMA);
            this.cache = opts.initialCacheData;
        } else {
            this.cache = { keys: {}, names: {} };
        }
    }

    saveCache() {
        return this.save(this.cache);
    }

    async getActiveKeysAtHeight(identityChainId, blockHeight = Infinity) {
        const cachedData = getCachedData.call(this, identityChainId);
        let saveCache = false;

        if (cachedData.length === 0) {
            const entries = await getEntries(this.cli, identityChainId);

            if (entries.length === 0) {
                throw new Error(`Invalid identity chain [${identityChainId}]`);
            }

            const firstEntry = entries.shift();
            const activeKeys = getInitialKeys(firstEntry);
            cacheIdentityName.call(this, identityChainId, firstEntry);

            cachedData.push({
                height: firstEntry.blockContext.directoryBlockHeight,
                activeKeys: [...activeKeys],
                allKeys: [...activeKeys]
            });
            saveCache = true;

            applyKeyRotations(identityChainId, activeKeys, activeKeys, entries, cachedData);
        } else {
            const latestDataCached = cachedData[cachedData.length - 1];
            // If the data is requested for an height lower than what was alreay parsed
            // it means we don't need to fetch anything more and just read the result from the cached data
            // Otherwise fetch the entries down to the latest height that was processed
            if (blockHeight > latestDataCached.height) {
                const entries = await getEntries(
                    this.cli,
                    identityChainId,
                    latestDataCached.height
                );

                if (entries.length > 0) {
                    applyKeyRotations(
                        identityChainId,
                        latestDataCached.activeKeys,
                        latestDataCached.allKeys,
                        entries,
                        cachedData
                    );
                    saveCache = true;
                }
            }
        }

        if (saveCache) {
            await this.saveCache();
        }

        return findActiveKeysAtHeight(cachedData, blockHeight);
    }

    async getIdentityName(identityChainId) {
        if (this.cache.names[identityChainId]) {
            return this.cache.names[identityChainId].map(n => Buffer.from(n, 'hex'));
        }

        const firstEntry = await this.cli.getFirstEntry(identityChainId);
        // getInitialKeys() is used to validate that this is a valid identity chain first entry
        getInitialKeys(firstEntry);
        cacheIdentityName.call(this, identityChainId, firstEntry);
        await this.saveCache();

        return this.cache.names[identityChainId].map(n => Buffer.from(n, 'hex'));
    }
}

function findActiveKeysAtHeight(cachedData, blockHeight) {
    if (cachedData[0].height > blockHeight) {
        throw new Error(`Identity chain didn't exist at height ${blockHeight}`);
    }

    for (let i = cachedData.length - 1; i >= 0; --i) {
        if (cachedData[i].height <= blockHeight) {
            return cachedData[i].activeKeys;
        }
    }
}

function getCachedData(identityChainId) {
    if (!Array.isArray(this.cache.keys[identityChainId])) {
        this.cache.keys[identityChainId] = [];
    }
    return this.cache.keys[identityChainId];
}

function applyKeyRotations(chainId, initialActiveKeys, initialAllKeys, entries, cachedData) {
    let activeKeys = [...initialActiveKeys];
    const allKeys = new Set(initialAllKeys);

    for (let i = 0; i < entries.length; ++i) {
        const entry = entries[i];

        if (entry.extIds.length === 5 && entry.extIds[0].toString() === 'ReplaceKey') {
            activeKeys = getUpdatedActiveKeys(chainId, activeKeys, allKeys, entry);
            activeKeys.forEach(k => allKeys.add(k));

            cachedData.push({
                height: entry.blockContext.directoryBlockHeight,
                activeKeys: [...activeKeys],
                allKeys: [...allKeys]
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
    if (
        signature.length !== 64 ||
        !sign.detached.verify(signedData, signature, extractCryptoMaterial(signingKey))
    ) {
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

async function getEntries(cli, identityChainId, lowerBoundHeight = -1) {
    const entries = [];

    await cli.rewindChainWhile(
        identityChainId,
        entry => entry.blockContext.directoryBlockHeight > lowerBoundHeight,
        function(entry) {
            if (basicValidation(entry)) {
                entries.push(entry);
            }
        }
    );

    return entries.reverse();
}

function basicValidation(e) {
    if (e.extIds.length === 0) {
        return false;
    }
    const firstExtId = e.extIds[0].toString();
    return firstExtId === 'ReplaceKey' || firstExtId === 'IdentityChain';
}

function cacheIdentityName(chainId, entry) {
    const identityName = entry.extIds.slice(1).map(e => e.toString('hex'));
    this.cache.names[chainId] = identityName;
}

module.exports = {
    IdentityInformationRetriever
};
