const { WalletdCli } = require('factom');
const { isValidIdentityKey, isValidSecretIdentityKey, getPublicIdentityKey } = require('./key-helpers');

/**
 * Helper class to user factom-walletd as a key store.
 * @memberof app
 * @param {Object} [opts] - Options of connection to factom-walletd. See {@link https://factomjs.luciap.ca/#connectionoptions}.
 * @example
 * const store = new FactomWalletdKeyStore({
 *          host: 'localhost',
 *          user: 'paul',
 *          password: 'pass'
 * });
 */
class FactomWalletdKeyStore {
    constructor(opts) {
        this.cli = new WalletdCli(opts);
    }

    /**
     * Fetch corresponding identity key from the wallet if necessary.
     * @async
     * @param {string} idKey - Identity key.
     * @returns {string} - Corresponsing secret identity key.
     */
    async getSecretIdentityKey(idKey) {
        if (!isValidIdentityKey(idKey)) {
            throw new Error(`${idKey} is not a valid identity key.`);
        }
        if (idKey[2] === 's') {
            return idKey;
        } else {
            const { secret } = await this.cli.call('identity-key', { public: idKey });
            return secret;
        }
    }

    /**
     * Import keys in walletd.
     * @async
     * @param {string|string[]} secretIdKeys - A single secret key or an array of secret keys to import.
     * @returns {{public: string, secret: string}[]}
     */
    async importIdentityKeys(secretIdKeys) {
        let params;
        if (Array.isArray(secretIdKeys)) {
            if (!secretIdKeys.every(k => isValidSecretIdentityKey(k))) {
                throw new Error('Some argument keys are not valid secret identity keys');
            }
            params = secretIdKeys.map(k => ({ secret: k }));
        } else {
            if (!isValidSecretIdentityKey(secretIdKeys)) {
                throw new ('Argument is not a valid secret identity key.');
            }
            params = [{ secret: secretIdKeys }];
        }

        const { keys } = await this.cli.call('import-identity-keys', { keys: params });
        return keys;
    }

    /**
     * Remove from walletd some identity keys.
     * @param {string|string[]} idKeys 
     */
    async removeIdentityKeys(idKeys) {
        let publicIdKeys = [];
        if (Array.isArray(idKeys)) {
            if (!idKeys.every(k => isValidIdentityKey(k))) {
                throw new Error('Some argument identity keys are not valid');
            }
            publicIdKeys = idKeys.map(k => getPublicIdentityKey(k));
        } else {
            if (!isValidIdentityKey(idKeys)) {
                throw new Error('Argument is not a valid identity key.');
            }
            publicIdKeys = [getPublicIdentityKey(idKeys)];
        }

        await Promise.all(publicIdKeys.map(key => this.cli.call('remove-identity-key', {
            public: key
        })));
    }

    /**
     * Get all identity keys stored in walletd.
     * @async
     * @returns {{public: string, secret: string}[]}
     */
    async getAllIdentityKeys() {
        const { keys } = await this.cli.call('all-identity-keys');
        return keys ? keys : [];
    }

    /**
     * Generates a new identity key from the wallet seed and stores it into walletd. 
     * New keys are generated from the same mnemonic seed used for FCT and EC addresses.
     * @async
     * @param {number} [number=1] - Number of identity keys to generate.
     * @returns {{public: string, secret: string}}
     */
    async generateIdentityKey(number) {
        const nb = number || 1;
        if (typeof nb !== 'number' || nb < 1) {
            throw new Error(`Invalid number of identity keys to generate: ${nb}`);
        }

        const keys = [];
        for (let i = 0; i < nb; ++i) {
            keys.push(await this.cli.call('generate-identity-key'));
        }

        return keys;
    }
}

module.exports = FactomWalletdKeyStore;