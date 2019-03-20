const { Chain, Entry } = require('factom'),
    { extractCryptoMaterial } = require('./key-helpers'),
    sign = require('tweetnacl/nacl-fast').sign;

function generateIdentityChain(name, publicKeys) {
    if (!Array.isArray(name)) {
        throw new Error('Name argument must be an array of strings of Buffers');
    }

    const extIds = [Buffer.from('IdentityChain', 'utf8')].concat(name.map(n => Buffer.from(n, 'utf8')));
    const content = JSON.stringify(Object.assign({ 'version': 1 }, { keys: publicKeys }));

    const entry = Entry.builder()
        .extIds(extIds)
        .content(content, 'utf8')
        .build();

    return new Chain(entry);
}

function generateIdentityKeyReplacementEntry(chainId, oldPublicIdKey, newPublicIdKey, signingIdKey) {

    const seed = extractCryptoMaterial(signingIdKey.secret);
    const key = sign.keyPair.fromSeed(seed);
    const signature = Buffer.from(sign.detached(Buffer.from(chainId + oldPublicIdKey + newPublicIdKey), key.secretKey));

    return Entry.builder()
        .chainId(chainId)
        .extId('ReplaceKey', 'utf8')
        .extId(oldPublicIdKey, 'utf8')
        .extId(newPublicIdKey, 'utf8')
        .extId(signature, 'utf8')
        .extId(signingIdKey.public, 'utf8')
        .build();
}

module.exports = {
    generateIdentityChain,
    generateIdentityKeyReplacementEntry
};