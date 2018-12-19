const { FactomCli } = require('factom');
const { getSecretIdentityKey,
    getActivePublicIdentityKeys,
    isIdentityKeyActive,
    importIdentityKeys,
    removeIdentityKeys,
    createIdentity,
    generateIdentityKeyFromWalletSeed,
    getAllIdentityKeys,
    replaceIdentityKey } = require('./identity-management');

/**
 * Main class to read and write Factom identities.
 * @memberof digital
 * @param {Object} [opts] - Options of connection to factomd and factom-walletd.
 * @param {Object} [opts.factomd] - Options of connection to factomd. See {@link https://factomjs.luciap.ca/#connectionoptions}.
 * @param {Object} [opts.walletd] - Options of connection to factom-walletd. See {@link https://factomjs.luciap.ca/#connectionoptions}.
 * @example
 * const manager = new FactomIdentityManager({
 *      factomd: {
 *          host: 'api.factomd.net',
 *          port: 443,
 *          protocol: 'https'
 *      },
 *      walletd: {
 *          host: 'localhost',
 *          user: 'paul',
 *          password: 'pass'
 *      }
 * });
 */
class FactomIdentityManager {
    constructor(opts) {
        this.cli = new FactomCli(opts);
    }

    /**
     * Fetch corresponding identity key from the wallet if necessary.
     * @async
     * @param {string} idKey - Identity key.
     * @returns {string} - Corresponsing secret identity key.
     */
    async getSecretIdentityKey(idKey) {
        return getSecretIdentityKey(this.cli, idKey);
    }

    /**
     * Get all the active public identity keys of an identity at a given blockchain height.
     * If no block height is specified, check for the latest block height.
     * @async
     * @param {string} identityChainId - Identity chain id.
     * @param {number} [blockHeight] - Specific blockchain height. If not provided check for the latest block. 
     * @returns {string[]} - Array of public identity keys active for the identity.
     */
    async getActivePublicIdentityKeys(identityChainId, blockHeight) {
        return getActivePublicIdentityKeys(this.cli, identityChainId, blockHeight);
    }

    /**
     * Check if an identity key is (was) active for an identity at a given blockchain height.
     * If no block height is specified, check for the latest block height.
     * @async
     * @param {string} identityChainId - Identity chain id.
     * @param {string} idKey - Public or private identity key.
     * @param {number} [blockHeight] - Specific blockchain height. If not provided check for the latest block. 
     * @returns {boolean} - True if the identity key is active for the identity.
     */
    async isIdentityKeyActive(identityChainId, idKey, blockHeight) {
        return isIdentityKeyActive(this.cli, identityChainId, idKey, blockHeight);
    }

    /**
     * Create a new identity on-chain.
     * @async
     * @param {string[]} name - Array of strings used as the "name" of the identity.
     * @param {string[] | number} keys - Either an array of identity keys (available in walletd) or a number. 
     * If a number is provided the library creates new keys (see options argument).
     * @param {string} ecAddress - Entry Credit address paying for the entry. 
     * If a public EC address is provided the library attempts to retrieve the secret part from walletd.
     * @param {Object} [options] 
     * @param {boolean} [options.fromWalletSeed] - Relevant only if parameter keys is a number. 
     * If true the new keys are generated from walletd (derived from its seed) and the new keys are automatically stored in walletd.
     * If false the new keys are generated randomly and are *not* automatically stored in walletd, it is user responsability to manage the new keys returned by the function.
     * @returns {{ identityKeys: {public: string, secret:string}, txId: string, repeatedCommit: boolean, chainId: string, entryHash: string }[]} - 
     * Info about the Chain creation together with the list of identity keys associated with the new identity.
     */
    async createIdentity(name, keys, ecAddress, options) {
        return createIdentity(this.cli, name, keys, ecAddress, options);
    }

    /**
     * Replace an identity key by another on-chain.
     * @async
     * @param {string} identityChainId - Identity chain id.
     * @param {Object} keys
     * @param {string} keys.oldIdKey - Old public identity key to replace.
     * @param {string} keys.newIdKey - New public identity key to take the place of oldIdKey.
     * @param {string} keys.signingIdKey - Identity key signing for the replacement. Must be of a higher priority than oldIdKey.
     * If a public identity key is provided the library attempts to retrieve the secret part from walletd.
     * @param {string} ecAddress - Entry Credit address paying for the entry. 
     * If a public EC address is provided the library attempts to retrieve the secret part from walletd.
     * @returns {{ txId: string, repeatedCommit: boolean, chainId: string, entryHash: string }} - Info about the Entry insertion.
     */
    async replaceIdentityKey(identityChainId, keys, ecAddress) {
        return replaceIdentityKey(this.cli, identityChainId, keys, ecAddress);
    }

    /**
     * Store keys in walletd.
     * @async
     * @param {string|string[]} secretIdKeys - A single secret key or an array of secret keys to import.
     * @returns {{public: string, secret: string}[]}
     */
    async importIdentityKeys(secretIdKeys) {
        return importIdentityKeys(this.cli, secretIdKeys);
    }

    /**
     * Remove from walletd some identity keys.
     * @param {string|string[]} idKeys 
     */
    async removeIdentityKeys(idKeys) {
        return removeIdentityKeys(this.cli, idKeys);
    }

    /**
     * Get all identity keys stored in walletd.
     * @async
     * @returns {{public: string, secret: string}[]}
     */
    async getAllIdentityKeys() {
        return getAllIdentityKeys(this.cli);
    }

    /**
     * Creates a new identity key and adds it to walletd. 
     * New keys are generated from the same mnemonic seed used for FCT and EC addresses.
     * @async
     * @param {number} [number=1] - Number of identity keys to generate.
     * @returns {{public: string, secret: string}}
     */
    async generateIdentityKeyFromWalletSeed(number) {
        return generateIdentityKeyFromWalletSeed(this.cli, number);
    }
}

module.exports = {
    FactomIdentityManager
};
