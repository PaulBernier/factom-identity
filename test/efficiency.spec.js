const assert = require('chai').assert;
const eff = require('../src/efficiency');

describe('Efficiency', function () {

    it('should generate efficiency update entry', function () {

        const entry = eff.generateUpdateEntry(
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
            49.52,
            'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk');

        assert.equal(entry.chainId.toString('hex'), '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584');
        assert.equal(entry.extIds[0].toString('hex'), '00');
        assert.equal(entry.extIds[1].toString('hex'), '53657276657220456666696369656e6379');
        assert.equal(entry.extIds[2].toString('hex'), '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762');
        assert.equal(entry.extIds[3].toString('hex'), '1358');
        assert.equal(entry.extIds[5].toString('hex'), '0125b0e7fd5e68b4dec40ca0cd2db66be84c02fe6404b696c396e3909079820f61');
    });


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