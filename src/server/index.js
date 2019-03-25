/**
 * Module containing functions about Factom server identities.
 * @module server
 */

const efficiency = require('./efficiency');
const coinbaseAddress = require('./coinbase-address');
const coinbaseCancel = require('./coinbase-cancel');
const { FactomServerIdentityManager } = require('./factom-server-identity-manager');

module.exports = {
    FactomServerIdentityManager,
    ...require('./validation'),
    generateEfficiencyUpdateEntry: efficiency.generateUpdateEntry,
    generateCoinbaseAddressUpdateEntry: coinbaseAddress.generateUpdateEntry,
    generateCoinbaseCancelEntry: coinbaseCancel.generateCoinbaseCancelEntry
};
