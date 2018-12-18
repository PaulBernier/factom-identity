/**
 * Module containing functions about Factom digital identities.
 * @module digital
 */
const { FactomIdentityManager } = require('./factom-identity-manager');


module.exports = {
    FactomIdentityManager,
    ...require('./key-helpers')
};