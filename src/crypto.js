const base58 = require('base-58'),
    sha256 = require('hash.js/lib/hash/sha/256'),
    nacl = require('tweetnacl/nacl-fast').sign;

function sha256d(data) {
    return Buffer.from(sha256().update(sha256().update(data).digest()).digest());
}

function secretToPublicKey(secret) {
    const key = nacl.keyPair.fromSeed(secret);
    return Buffer.from(key.publicKey);
}

function extractSecretFromIdentityKey(key) {
    let hexKey;
    // Need to be decoded if human readable format
    if (key.slice(0, 2) === 'sk') {
        hexKey = Buffer.from(base58.decode(key));
    } else {
        hexKey = Buffer.from(key, 'hex');
    }

    return Buffer.from(hexKey.slice(3, 35));
}

function verify(identityKeyPreImage, data, signature) {
    const publicKey = identityKeyPreImage.slice(1);
    return nacl.detached.verify(data, signature, publicKey);
}

function sign(secret, dataToSign) {
    const pub = secretToPublicKey(secret);
    const identityKeyPreImage = Buffer.concat([Buffer.from('01', 'hex'), pub]);

    const key = nacl.keyPair.fromSeed(secret);
    const signature = Buffer.from(nacl.detached(dataToSign, key.secretKey));

    return {
        identityKeyPreImage: identityKeyPreImage,
        signature: signature
    };
}


module.exports = {
    sha256d,
    verify,
    sign,
    secretToPublicKey,
    extractSecretFromIdentityKey
};
