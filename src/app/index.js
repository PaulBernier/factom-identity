/**
 * Module containing functions about Factom identities for applications.
 * @module app
 */
const { FactomIdentityManager } = require('./factom-identity-manager');


module.exports = {
    FactomIdentityManager,
    ...require('./key-helpers')
};