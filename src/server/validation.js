const base58 = require('base-58');
const { sha256d } = require('../crypto');
const { SERVER_IDENTITY_KEY_HEX_PREFIX_MAP, SERVER_IDENTITY_KEY_PREFIXES } = require('./constant');

function isValidSk1(key) {
    return isValidIdentityKey(key, 'sk1');
}

function isValidSk2(key) {
    return isValidIdentityKey(key, 'sk2');
}

function isValidSk3(key) {
    return isValidIdentityKey(key, 'sk3');
}

function isValidSk4(key) {
    return isValidIdentityKey(key, 'sk4');
}

function isValidIdentityKey(key, prefixes) {
    if (typeof key !== 'string') {
        return false;
    }
    const validPrefixes = getValidPrefixes(prefixes);

    let bytes;
    if (validPrefixes.has(key.slice(0, 3))) {
        bytes = Buffer.from(base58.decode(key));
    } else {
        const validHexPrefixes = new Set(
            [...validPrefixes].map(p => SERVER_IDENTITY_KEY_HEX_PREFIX_MAP[p])
        );
        if (validHexPrefixes.has(key.slice(0, 6))) {
            bytes = Buffer.from(key, 'hex');
        } else {
            return false;
        }
    }

    if (bytes.length !== 39) {
        return false;
    }

    const checksum = sha256d(bytes.slice(0, 35)).slice(0, 4);
    if (checksum.equals(bytes.slice(35, 39))) {
        return true;
    }

    return false;
}

function getValidPrefixes(prefixes) {
    if (!prefixes) {
        return SERVER_IDENTITY_KEY_PREFIXES;
    } else if (typeof prefixes === 'string') {
        return new Set([prefixes]);
    } else if (Array.isArray(prefixes)) {
        return new Set(prefixes);
    } else {
        throw new Error('Invalid prefixes');
    }
}

function isValidServerIdentityChainId(identityChainId) {
    return (
        typeof identityChainId === 'string' &&
        identityChainId.length === 64 &&
        identityChainId.startsWith('888888')
    );
}

module.exports = {
    isValidSk1,
    isValidSk2,
    isValidSk3,
    isValidSk4,
    isValidIdentityKey,
    isValidServerIdentityChainId
};
