const nacl = require('tweetnacl/nacl-fast'),
    base58 = require('base-58'),
    { secretToPublicKey } = require('../crypto');

function getNowTimestamp8BytesBuffer() {
    const timestamp = Buffer.alloc(8);
    timestamp.writeIntBE(parseInt(Date.now() / 1000), 2, 6);
    return timestamp;
}

function verify(identityKeyPreImage, data, signature) {
    const publicKey = identityKeyPreImage.slice(1);
    return nacl.sign.detached.verify(data, signature, publicKey);
}

function sign(secret, dataToSign) {
    const pub = secretToPublicKey(secret);
    const identityKeyPreImage = Buffer.concat([Buffer.from('01', 'hex'), pub]);

    const key = nacl.sign.keyPair.fromSeed(secret);
    const signature = Buffer.from(nacl.sign.detached(dataToSign, key.secretKey));

    return {
        identityKeyPreImage: identityKeyPreImage,
        signature: signature
    };
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

module.exports = {
    getNowTimestamp8BytesBuffer,
    verify,
    sign,
    extractSecretFromIdentityKey
};
