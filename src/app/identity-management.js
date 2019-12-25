const { generateIdentityChain, generateIdentityKeyReplacementEntry } = require('./identity-struct'),
    {
        isValidIdentityKey,
        isValidSecretIdentityKey,
        getPublicIdentityKey,
        generateRandomIdentityKeyPair
    } = require('./key-helpers');

async function createIdentity(cli, name, keys, ecAddress) {
    const identityKeys = getIdentityKeys(keys);
    const publicKeys = identityKeys.map(idKey => idKey.public);

    const idChain = generateIdentityChain(name, publicKeys);
    const added = await cli.add(idChain, ecAddress);

    return Object.assign(added, { identityKeys });
}

function getIdentityKeys(identityKeys) {
    const result = [];

    if (typeof identityKeys === 'number') {
        for (let i = 0; i < identityKeys; ++i) {
            result.push(generateRandomIdentityKeyPair());
        }
    } else if (Array.isArray(identityKeys)) {
        for (const idKey of identityKeys) {
            if (!isValidIdentityKey(idKey)) {
                throw new Error(`${idKey} is not a valid identity key.`);
            }
            result.push({ public: getPublicIdentityKey(idKey) });
        }
    } else {
        throw new Error(`Invalid \`keys\` argument type: ${typeof identityKeys}`);
    }

    return result;
}

async function replaceIdentityKey(cli, identityRetriever, identityChainId, keys, ecAddress) {
    if (!isValidSecretIdentityKey(keys.signingSecretIdKey)) {
        throw new Error('signingSecretIdKey must be a valid secret identity key');
    }

    const oldPublicIdKey = getPublicIdentityKey(keys.oldIdKey);
    const newPublicIdKey = getPublicIdentityKey(keys.newIdKey);
    const signingIdKey = {
        public: getPublicIdentityKey(keys.signingSecretIdKey),
        secret: keys.signingSecretIdKey
    };

    const activeKeys = await identityRetriever.getActiveKeysAtHeight(identityChainId);

    if (!activeKeys.includes(oldPublicIdKey)) {
        throw new Error(
            `Old identity key ${oldPublicIdKey} is not part of the active keys: [${activeKeys}].`
        );
    }
    if (!activeKeys.includes(signingIdKey.public)) {
        throw new Error(
            `Signer identity key ${signingIdKey.public} is not part of the active keys: [${activeKeys}].`
        );
    }
    if (activeKeys.indexOf(oldPublicIdKey) < activeKeys.indexOf(signingIdKey.public)) {
        throw new Error(
            `Priority of the signing key ${signingIdKey.public} is not sufficient to replace the key ${oldPublicIdKey}`
        );
    }

    const entry = generateIdentityKeyReplacementEntry(
        identityChainId,
        oldPublicIdKey,
        newPublicIdKey,
        signingIdKey
    );

    return cli.add(entry, ecAddress);
}

module.exports = {
    createIdentity,
    replaceIdentityKey
};
