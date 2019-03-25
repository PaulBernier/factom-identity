/**
 * Module containing functions about Factom identities for applications.
 * @module app
 */
const FactomIdentityManager = require('./factom-identity-manager');
const FactomWalletdKeyStore = require('./walletd-key-store');

module.exports = {
    FactomIdentityManager,
    ...require('./key-helpers'),
    FactomWalletdKeyStore
};
