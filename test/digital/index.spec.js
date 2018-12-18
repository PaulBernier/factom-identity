const assert = require('chai').assert;
const digital = require('../../src/digital');

describe('Factom identity digital module exports', function () {

    it('Should export digital module', function () {
        assert.isFunction(digital.FactomIdentityManager);
        assert.isFunction(digital.isValidIdentityKey);
        assert.isFunction(digital.isValidPublicIdentityKey);
        assert.isFunction(digital.isValidSecretIdentityKey);
        assert.isFunction(digital.extractCryptoMaterial);
        assert.isFunction(digital.getPublicIdentityKey);
        assert.isFunction(digital.keyToPublicIdentityKey);
        assert.isFunction(digital.seedToSecretIdentityKey);
        assert.isFunction(digital.generateRandomIdentityKeyPair);        
    });

});