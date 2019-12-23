const { FactomCli } = require('factom');
const { getPublicIdentityKey } = require('./key-helpers');
const { IdentityInformationRetriever } = require('./identity-information-retriever');
const { createIdentity, replaceIdentityKey } = require('./identity-management');

/**
 * Main class to read and write Factom identities.
 * @memberof app
 * @param {Object} [daemonsConfig] - Configs of connection to factomd and factom-walletd.
 * @param {Object} [daemonsConfig.factomd] - Configs of connection to factomd. See {@link https://factomjs.luciap.ca/#connectionoptions}.
 * @param {Object} [daemonsConfig.walletd] - Configs of connection to factom-walletd. See {@link https://factomjs.luciap.ca/#connectionoptions}.
 * @param {Object} [opts] - Options.
 * @param {Object} [opts.initialCacheData] - Populate cache with some initial data.
 * @param {Function} [opts.save] - Synchronous or asynchronous function called to save the state of the cache.
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
    constructor(daemonsConfig, opts) {
        this.cli = new FactomCli(daemonsConfig);
        this.identityRetriever = new IdentityInformationRetriever(this.cli, opts);
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
        return this.identityRetriever.getActiveKeysAtHeight(identityChainId, blockHeight);
    }

    /**
     * Retrieve the identity "name" that was set at the creation of the identity chain.
     * @param {string} identityChainId - Identity chain id.
     * @returns {Buffer[]} - Array of Buffer representing the name of the identity.
     */
    async getIdentityName(identityChainId) {
        return this.identityRetriever.getIdentityName(identityChainId);
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
        const publicIdentityKey = getPublicIdentityKey(idKey);

        const keys = await this.identityRetriever.getActiveKeysAtHeight(
            identityChainId,
            blockHeight
        );

        return keys.includes(publicIdentityKey);
    }

    /**
     * Create a new identity on-chain.
     * @async
     * @param {string[]} name - Array of strings used as the "name" of the identity.
     * @param {string[] | number} keys - Either an array of public identity keys or a number.
     * If a number is provided the library generate new random keys (the secret keys are part of the returned object).
     * @param {string} ecAddress - Entry Credit address paying for the entry.
     * If a public EC address is provided the library attempts to retrieve the secret part from the configured walletd instance.
     * @returns {{ identityKeys: {public: string, secret:string}, txId: string, repeatedCommit: boolean, chainId: string, entryHash: string }[]} -
     * Info about the Chain creation together with the list of identity keys associated with the new identity.
     */
    async createIdentity(name, keys, ecAddress) {
        return createIdentity(this.cli, name, keys, ecAddress);
    }

    /**
     * Replace an identity key by another on-chain.
     * @async
     * @param {string} identityChainId - Identity chain id.
     * @param {Object} keys
     * @param {string} keys.oldIdKey - Old public identity key to replace.
     * @param {string} keys.newIdKey - New public identity key to take the place of oldIdKey.
     * @param {string} keys.signingSecretIdKey - Secret identity key signing for the replacement. Must be of same or higher priority than oldIdKey.
     * @param {string} ecAddress - Entry Credit address paying for the entry.
     * If a public EC address is provided the library attempts to retrieve the secret part from the configured walletd instance.
     * @returns {{ txId: string, repeatedCommit: boolean, chainId: string, entryHash: string }} - Info about the Entry insertion.
     */
    async replaceIdentityKey(identityChainId, keys, ecAddress) {
        return replaceIdentityKey(
            this.cli,
            this.identityRetriever,
            identityChainId,
            keys,
            ecAddress
        );
    }
}

module.exports = FactomIdentityManager;
