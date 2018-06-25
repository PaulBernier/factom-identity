const crypto = require('crypto');
const base58 = require('base-58');
const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');

function sha256(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest();
}

function sha256d(data) {
    return sha256(sha256(data));
}

function privateKeyToPublicKey(privateKey, enc) {
    const key = ec.keyFromSecret(Buffer.from(privateKey, enc));
    return Buffer.from(key.getPublic());
}

function extractSecretFromIdentityKey(sk) {
    return Buffer.from(base58.decode(sk).slice(3, 35));
}

function verify(keyBuff, data, signature) {
    const key = ec.keyFromPublic([...keyBuff.slice(1)]);
    return key.verify(data, [...signature]);
}

function sign(secret, dataToSign) {
    const pub = privateKeyToPublicKey(secret);
    const identityKeyPreImage = Buffer.concat([Buffer.from('01', 'hex'), pub]);

    const key = ec.keyFromSecret(secret);
    const signature = Buffer.from(key.sign(dataToSign).toBytes());

    return {
        identityKeyPreImage: identityKeyPreImage,
        signature: signature
    };
}


module.exports = {
    sha256d,
    verify,
    sign,
    privateKeyToPublicKey,
    extractSecretFromIdentityKey
};
