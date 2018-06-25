const { FactomIdentityManager } = require('./factom-identity-manager');
const efficiency = require('./efficiency');
const coinbaseAddress = require('./coinbase-address');

module.exports = {
    FactomIdentityManager,
    validation: require('./validation'),
    generateEfficiencyUpdateEntry: efficiency.generateUpdateEntry,
    generateCoinbaseAddressUpdateEntry: coinbaseAddress.generateUpdateEntry
};