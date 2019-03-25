const { FactomCli } = require('factom');
const coinbaseAdress = require('./coinbase-address');
const eff = require('./efficiency');
const coinbaseCancel = require('./coinbase-cancel');
const getServer = require('./get');

/**
 * Main class to read and write Factom identities.
 * @memberof server
 * @param {Object} [opts] - Options of connection to factomd and factom-walletd.
 * @param {Object} [opts.factomd] - Options of connection to factomd. See {@link https://factomjs.luciap.ca/#connectionoptions}.
 * @param {Object} [opts.walletd] - Options of connection to factom-walletd. See {@link https://factomjs.luciap.ca/#connectionoptions}.
 * @example
 * const manager = new FactomServerIdentityManager({
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
class FactomServerIdentityManager {
    constructor(opts) {
        this.cli = new FactomCli(opts);
    }

    /**
     * Get a server identity information.
     * @async
     * @param {string} rootChainId - Identity Root Chain Id.
     * @returns {{rootChainId: string, serverManagementSubchainId: string, coinbaseAddress: string, efficiency: number, identityKeys: string[]}}
     */
    async getServerIdentity(rootChainId) {
        return getServer.getIdentity(this.cli, rootChainId);
    }

    /**
     * Get a server identity information history.
     * @async
     * @param {string} rootChainId - Identity Root Chain Id.
     * @returns {{rootChainId: string, serverManagementSubchainId: string, coinbaseAddressHistory: Object[], efficiencyHistory: Object[], identityKeys: string[]}}
     */
    async getServerIdentityHistory(rootChainId) {
        return getServer.getIdentityHistory(this.cli, rootChainId);
    }

    /**
     * Update the coinbase address of a server identity.
     * @param {string} rootChainId - Identity Root Chain Id.
     * @param {string} fctAddress - Public Factoid address to set as coinbase address.
     * @param {string} sk1 - Server identity Secret Key 1.
     * @param {string} ecAddress - Entry Credit address paying for the entry.
     * @returns {{ txId: string, repeatedCommit: boolean, chainId: string, entryHash: string }} - Info about the Entry insertion.
     */
    async updateCoinbaseAddress(rootChainId, fctAddress, sk1, ecAddress) {
        return coinbaseAdress.update(this.cli, rootChainId, fctAddress, sk1, ecAddress);
    }

    /**
     * Update the efficiency of a server identity.
     * @param {string} rootChainId - Identity Root Chain Id.
     * @param {number} efficiency - Efficiency between 0 and 100.
     * @param {string} sk1 - Server identity Secret Key 1.
     * @param {string} ecAddress - Entry Credit address paying for the entry.
     * @returns {{ txId: string, repeatedCommit: boolean, chainId: string, entryHash: string }} - Info about the Entry insertion.
     */
    async updateEfficiency(rootChainId, efficiency, sk1, ecAddress) {
        return eff.update(this.cli, rootChainId, efficiency, sk1, ecAddress);
    }

    /**
     * Add a coinbase cancel message to a server identity.
     * @param {string} rootChainId - Identity Root Chain Id.
     * @param {number} descriptorHeight - Coinbase descriptor block height.
     * @param {number} descriptorIndex - Coinbase descriptor index.
     * @param {string} sk1 - Server identity Secret Key 1.
     * @param {string} ecAddress - Entry Credit address paying for the entry.
     * @returns {{ txId: string, repeatedCommit: boolean, chainId: string, entryHash: string }} - Info about the Entry insertion.
     */
    async addCoinbaseCancel(rootChainId, descriptorHeight, descriptorIndex, sk1, ecAddress) {
        return coinbaseCancel.add(
            this.cli,
            rootChainId,
            descriptorHeight,
            descriptorIndex,
            sk1,
            ecAddress
        );
    }
}

module.exports = {
    FactomServerIdentityManager
};
