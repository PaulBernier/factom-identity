const assert = require('chai').assert;
const factomIdentity = require('../src');

describe('Factom identity exports', function () {

    it('Should export digital module', function () {
        assert.isObject(factomIdentity.digital);
    });

    it('Should export server module', function () {
        assert.isObject(factomIdentity.server);
    });

});