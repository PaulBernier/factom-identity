const assert = require('chai').assert;
const eff = require('../src/efficiency');

describe('Efficiency', function () {

    it('should reject equal root chain id and server management subchain id', function () {
        try {
            eff.generateUpdateEntry(
                '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
                '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
                23,
                'sk12J1qQCjTRtnJ85bmb1iSinEvtzTQMBi5szzV793LUJQib36pvz');
            throw new Error('Should have thrown');
        } catch (e) {
            assert.include(e.message, 'cannot be the same');
        }
    });

});