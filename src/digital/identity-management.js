const { generateIdentityChain, generateIdentityKeyReplacementEntry } = require('./identity-struct'),
    { isValidIdentityKey, isValidSecretIdentityKey, getPublicIdentityKey, generateRandomIdentityKeyPair } = require('./key-helpers');

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
    let result = [];

    if (typeof identityKeys === 'number') {
        if (fromWalletSeed) {
            result = await generateIdentityKeyFromWalletSeed(cli, identityKeys);
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

async function importIdentityKeys(cli, secretIdKeys) {
    let params;
    if (Array.isArray(secretIdKeys)) {
        if (!secretIdKeys.every(k => isValidSecretIdentityKey(k))) {
            throw new Error('Some argument keys are not valid secret identity keys');
        }
        params = secretIdKeys.map(k => ({ secret: k }));
    } else {
        if (!isValidSecretIdentityKey(secretIdKeys)) {
            throw new ('Argument is not a valid secret identity key.');
        }
        params = [{ secret: secretIdKeys }];
    }

    const { keys } = await cli.walletdApi('import-identity-keys', { keys: params });
    return keys;
}

async function removeIdentityKeys(cli, idKeys) {
    let publicIdKeys = [];
    if (Array.isArray(idKeys)) {
        if (!idKeys.every(k => isValidIdentityKey(k))) {
            throw new Error('Some argument identity keys are not valid');
        }
        publicIdKeys = idKeys.map(k => getPublicIdentityKey(k));
    } else {
        if (!isValidIdentityKey(idKeys)) {
            throw new Error('Argument is not a valid identity key.');
        }
        publicIdKeys = [getPublicIdentityKey(idKeys)];
    }

    await Promise.all(publicIdKeys.map(key => cli.walletdApi('remove-identity-key', {
        public: key
    })));
}

async function getAllIdentityKeys(cli) {
    const { keys } = await cli.walletdApi('all-identity-keys');
    return keys;
}

async function generateIdentityKeyFromWalletSeed(cli, number) {
    const nb = number || 1;
    if (typeof nb !== 'number' || nb < 1) {
        throw new Error(`Invalid number of identity keys to generate: ${nb}`);
    }

    const keys = [];
    for (let i = 0; i < nb; ++i) {
        keys.push(await cli.walletdApi('generate-identity-key'));
    }

    return keys;
}

module.exports = {
    getAllIdentityKeys,
    getSecretIdentityKey,
    getActivePublicIdentityKeys,
    isIdentityKeyActive,
    createIdentity,
    replaceIdentityKey,
    importIdentityKeys,
    removeIdentityKeys,
    generateIdentityKeyFromWalletSeed
};