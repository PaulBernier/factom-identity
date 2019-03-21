const { isValidIdentityKey,
    isValidPublicIdentityKey,
    isValidSecretIdentityKey } = require('./key-helpers');

module.exports = joi => ({
    base: joi.string(),
    name: 'factom',
    language: {
        identityKey: 'needs to be a valid public or secret identity key',
        publicIdentityKey: 'needs to be a valid public identity key',
        secretIdentityKey: 'needs to be a valid secret identity key'
    },
    rules: [
        {
            name: 'identityKey',
            validate(params, value, state, options) {
                if (!isValidIdentityKey(value)) {
                    return this.createError('factom.isValidIdentityKey', { v: value }, state, options);
                }
                return value;
            }
        },
        {
            name: 'publicIdentityKey',
            validate(params, value, state, options) {
                if (!isValidPublicIdentityKey(value)) {
                    return this.createError('factom.publicIdentityKey', { v: value }, state, options);
                }
                return value;
            }
        },
        {
            name: 'secretIdentityKey',
            validate(params, value, state, options) {
                if (!isValidSecretIdentityKey(value)) {
                    return this.createError('factom.secretIdentityKey', { v: value }, state, options);
                }
                return value;
            }
        }
    ]
});