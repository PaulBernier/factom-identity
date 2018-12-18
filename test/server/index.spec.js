const assert = require('chai').assert;
const server = require('../../src/server');

describe('Factom identity server module exports', function () {

    it('Should export server module', function () {
        assert.isFunction(server.FactomServerIdentityManager);
        assert.isFunction(server.isValidSk1);
        assert.isFunction(server.isValidSk2);
        assert.isFunction(server.isValidSk3);
        assert.isFunction(server.isValidSk4);
        assert.isFunction(server.isValidServerIdentityChainId);
        assert.isFunction(server.generateEfficiencyUpdateEntry);
        assert.isFunction(server.generateCoinbaseAddressUpdateEntry);
        assert.isFunction(server.generateCoinbaseCancelEntry);
    });

});