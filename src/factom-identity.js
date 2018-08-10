const { FactomIdentityManager } = require('./factom-identity-manager');
const efficiency = require('./efficiency');
const coinbaseAddress = require('./coinbase-address');
const coinbaseCancel = require('./coinbase-cancel');

module.exports = {
    FactomIdentityManager,
    validation: require('./validation'),
    generateEfficiencyUpdateEntry: efficiency.generateUpdateEntry,
    generateCoinbaseAddressUpdateEntry: coinbaseAddress.generateUpdateEntry,
    generateCoinbaseCancelEntry: coinbaseCancel.generateCoinbaseCancelEntry
};