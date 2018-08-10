const base58 = require('base-58');
const { sha256d } = require('./crypto');

function isValidSk1(key) {
    return isValidSk('sk1', key);
}

function isValidSk2(key) {
    return isValidSk('sk2', key);
}

function isValidSk3(key) {
    return isValidSk('sk3', key);
}

function isValidSk4(key) {
    return isValidSk('sk4', key);
}

function isValidSk(prefix, key) {
    if (typeof key !== 'string' || key.slice(0, 3) !== prefix) {
        return false;
    }

    const bytes = Buffer.from(base58.decode(key));

    if (bytes.length !== 39) {
        return false;
    }

    const checksum = sha256d(bytes.slice(0, 35)).slice(0, 4);
    if (checksum.equals(bytes.slice(35, 39))) {
        return true;
    }
}

function isValidIdentityChainId(identityChainId) {
    return typeof identityChainId === 'string' &&
        identityChainId.length === 64 &&
        identityChainId.startsWith('888888');
}

module.exports = {
    isValidSk1,
    isValidSk2,
    isValidSk3,
    isValidSk4,
    isValidIdentityChainId,
};
