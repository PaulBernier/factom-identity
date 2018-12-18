const sha256 = require('hash.js/lib/hash/sha/256'),
    sign = require('tweetnacl/nacl-fast').sign;

function sha256d(data) {
    return Buffer.from(sha256().update(sha256().update(data).digest()).digest());
}

function secretToPublicKey(secret) {
    const key = sign.keyPair.fromSeed(secret);
    return Buffer.from(key.publicKey);
}

module.exports = {
    sha256d,
    secretToPublicKey,
};
