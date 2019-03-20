const base58 = require('base-58'),
    nacl = require('tweetnacl/nacl-fast'),
    sign = nacl.sign,
    { sha256d } = require('../crypto');

const ID_PUB_PREFIX = Buffer.from('0345ef9de0', 'hex'),
    ID_SEC_PREFIX = Buffer.from('0345f3d0d6', 'hex');
const VALID_ID_PREFIXES = new Set(['idpub', 'idsec']);

/**
 * Check if an identity key is well formed.
 * @memberof digital
 * @param {string} idKey - Public or secret identity key.
 * @returns {boolean} - True if the identity key is valid.
 */
function isValidIdentityKey(idKey) {
    try {
        if (typeof idKey !== 'string') {
            return false;
        }
        
        if (!VALID_ID_PREFIXES.has(idKey.slice(0, 5))) {
            return false;
        }

        const bytes = Buffer.from(base58.decode(idKey));
        if (bytes.length !== 41) {
            return false;
        }

        const checksum = sha256d(bytes.slice(0, 37)).slice(0, 4);
        if (checksum.equals(bytes.slice(37, 41))) {
            return true;
        }

        return false;
    } catch (err) {
        return false;
    }
}

/**
 * Check if a public identity key is well formed.
 * @memberof digital
 * @param {string} pubIdKey - Public identity key.
 * @returns {boolean} - True if the public identity key is valid.
 */
function isValidPublicIdentityKey(pubIdKey) {
    return isValidIdentityKey(pubIdKey) && pubIdKey.startsWith('idpub');
}

/**
 * Check if a secret identity key is well formed.
 * @memberof digital
 * @param {string} secIdKey - Public identity key.
 * @returns {boolean} - True if the secret identity key is valid.
 */
function isValidSecretIdentityKey(secIdKey) {
    return isValidIdentityKey(secIdKey) && secIdKey.startsWith('idsec');
}


/**
 * Extract the ed25519 cryptographic material encapsulated in the identity key.
 * @memberof digital
 * @param {string} idKey - Public or secret identity key.
 * @returns {Buffer} - Either the ed25519 32-byte public key or the 32-byte secret seed.
 */
function extractCryptoMaterial(idKey) {
    if (!isValidIdentityKey(idKey)) {
        throw new Error(`Invalid identity key ${idKey}.`);
    }
    return Buffer.from(base58.decode(idKey).slice(5, 37));
}

/**
 * Get the public identity key corresponding to the input identity key.
 * @memberof digital
 * @param {string} idKey - Secret (or public) identity key.
 * @returns {string} - Corresponding public identity key.
 */
function getPublicIdentityKey(idKey) {
    if (isValidPublicIdentityKey(idKey)) {
        return idKey;
    } else if (isValidSecretIdentityKey(idKey)) {
        const secret = extractCryptoMaterial(idKey);
        const publicKey = sign.keyPair.fromSeed(secret).publicKey;
        return keyToPublicIdentityKey(publicKey);
    } else {
        throw new Error(`Invalid identity key: ${idKey}`);
    }
}

/**
 * Convert a 32-byte key to a public identity key.
 * @memberof digital
 * @param {string | Buffer} key - 32-byte key.
 * @returns {string} - Public identity key.
 */
function keyToPublicIdentityKey(key) {
    return keyToIdentityKey(key, ID_PUB_PREFIX);
}

/**
 * Convert a 32-byte seed to a secret identity key.
 * @memberof digital
 * @param {string | Buffer} seed - 32-byte seed.
 * @returns {string} - Secret identity key.
 */
function seedToSecretIdentityKey(seed) {
    return keyToIdentityKey(seed, ID_SEC_PREFIX);
}

function keyToIdentityKey(key, prefix) {
    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== 32) {
        throw new Error('Key/seed must be 32 bytes long.');
    }

    const address = Buffer.concat([prefix, keyBuffer]);
    const checksum = sha256d(address).slice(0, 4);
    return base58.encode(Buffer.concat([address, checksum]));
}

/**
 * Generate a random identity key pair.
 * @memberof digital
 * @returns {{public: string, secret: string}} - Random identity key pair.
 */
function generateRandomIdentityKeyPair() {
    const seed = nacl.randomBytes(32);
    const keyPair = sign.keyPair.fromSeed(seed);
    return {
        public: keyToPublicIdentityKey(keyPair.publicKey),
        secret: seedToSecretIdentityKey(seed)
    };
}

module.exports = {
    isValidIdentityKey,
    isValidPublicIdentityKey,
    isValidSecretIdentityKey,
    extractCryptoMaterial,
    getPublicIdentityKey,
    keyToPublicIdentityKey,
    seedToSecretIdentityKey,
    generateRandomIdentityKeyPair
};