const { generateIdentityChain, generateIdentityKeyReplacementEntry } = require('./identity-struct'),
    { isValidIdentityKey, getPublicIdentityKey, generateRandomIdentityKeyPair } = require('./key-helpers');

async function getSecretIdentityKey(cli, idKey) {
    if (!isValidIdentityKey(idKey)) {
        throw new Error(`${idKey} is not a valid identity key.`);
    }
    if (idKey[2] === 's') {
        return idKey;
    } else {
        const { secret } = await cli.walletdApi('identity-key', { public: idKey });
        return secret;
    }
}

async function getActivePublicIdentityKeys(cli, identityChainId, blockHeight) {
    const { keys } = await cli.walletdApi('active-identity-keys', {
        chainid: identityChainId,
        height: blockHeight
    });

    return keys;
}

async function isIdentityKeyActive(cli, identityChainId, idKey, blockHeight) {
    const publicIdentityKey = getPublicIdentityKey(idKey);

    const keys = await getActivePublicIdentityKeys(cli, identityChainId, blockHeight);

    return keys.includes(publicIdentityKey);
}

async function createIdentity(cli, name, keys, ecAddress, options) {
    const opt = options || {};

    const identityKeys = await getIdentityKeys(cli, keys, opt.fromWalletSeed);
    const publicKeys = identityKeys.map(idKey => idKey.public);

    const idChain = generateIdentityChain(name, publicKeys);
    const added = await cli.add(idChain, ecAddress);

    return Object.assign(added, { identityKeys });
}

async function getIdentityKeys(cli, identityKeys, fromWalletSeed) {
    const result = [];

    if (typeof identityKeys === 'number') {
        if (fromWalletSeed) {
            for (let i = 0; i < identityKeys; ++i) {
                result.push(await cli.walletdApi('generate-identity-key'));
            }
        } else {
            for (let i = 0; i < identityKeys; ++i) {
                result.push(generateRandomIdentityKeyPair());
            }
        }
    } else if (Array.isArray(identityKeys)) {
        for (const idKey of identityKeys) {
            if (!isValidIdentityKey(idKey)) {
                throw new Error(`${idKey} is not a valid identity key.`);
            }
            if (idKey[2] === 's') {
                result.push({ public: getPublicIdentityKey(idKey), secret: idKey });
            } else {
                const { secret } = await cli.walletdApi('identity-key', { public: idKey });
                result.push({ public: idKey, secret });
            }
        }
    } else {
        throw new Error(`Invalid \`keys\` argument type: ${typeof identityKeys}`);
    }

    return result;
}

async function replaceIdentityKey(cli, identityChainId, keys, ecAddress) {
    const oldPublicIdKey = getPublicIdentityKey(keys.oldIdKey);
    const newPublicIdKey = getPublicIdentityKey(keys.newIdKey);
    const signingIdKey = { public: getPublicIdentityKey(keys.signingIdKey), secret: await getSecretIdentityKey(cli, keys.signingIdKey) };

    const activeKeys = await getActivePublicIdentityKeys(cli, identityChainId);

    if (!activeKeys.includes(oldPublicIdKey)) {
        throw new Error(`Old identity key ${oldPublicIdKey} is not part of the active keys: [${activeKeys}].`);
    }
    if (!activeKeys.includes(signingIdKey.public)) {
        throw new Error(`Signer identity key ${signingIdKey.public} is not part of the active keys: [${activeKeys}].`);
    }
    if (activeKeys.indexOf(oldPublicIdKey) <= activeKeys.indexOf(signingIdKey.public)) {
        throw new Error(`Priority of the signing key ${signingIdKey.public} is not sufficient to replace the key ${oldPublicIdKey}`);
    }

    const entry = generateIdentityKeyReplacementEntry(identityChainId, oldPublicIdKey, newPublicIdKey, signingIdKey);

    return cli.add(entry, ecAddress);
}


module.exports = {
    getSecretIdentityKey,
    getActivePublicIdentityKeys,
    isIdentityKeyActive,
    createIdentity,
    replaceIdentityKey
};