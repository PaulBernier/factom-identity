const assert = require('chai').assert;
const app = require('../../src/app');

describe('Factom identity for applications module exports', function () {

    it('Should export app module', function () {
        assert.isFunction(app.FactomWalletdKeyStore);
        assert.isFunction(app.FactomIdentityManager);
        assert.isFunction(app.isValidIdentityKey);
        assert.isFunction(app.isValidPublicIdentityKey);
        assert.isFunction(app.isValidSecretIdentityKey);
        assert.isFunction(app.extractCryptoMaterial);
        assert.isFunction(app.getPublicIdentityKey);
        assert.isFunction(app.keyToPublicIdentityKey);
        assert.isFunction(app.seedToSecretIdentityKey);
        assert.isFunction(app.generateRandomIdentityKeyPair);        
    });

});