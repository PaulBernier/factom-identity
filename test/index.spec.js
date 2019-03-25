const assert = require('chai').assert;
const factomIdentity = require('../src');

describe('Factom identity exports', function() {
    it('Should export app module', function() {
        assert.isObject(factomIdentity.app);
    });

    it('Should export server module', function() {
        assert.isObject(factomIdentity.server);
    });
});
