const assert = require('chai').assert;
const coinbaseAddress = require('../src/coinbase-address');

describe('Coinbase address', function () {

    it('should generate coinbase address update entry', function () {

        const entry = coinbaseAddress.generateUpdateEntry(
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            'FA1y5ZGuHSLmf2TqNf6hVMkPiNGyQpQDTFJvDLRkKQaoPo4bmbgu',
            'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk');

        assert.equal(entry.extIds[0].toString('hex'), '00');
        assert.equal(entry.extIds[1].toString('hex'), '436f696e626173652041646472657373');
        assert.equal(entry.extIds[2].toString('hex'), '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762');
        assert.equal(entry.extIds[3].toString('hex'), '0000000000000000000000000000000000000000000000000000000000000000');
        assert.equal(entry.extIds[5].toString('hex'), '0125b0e7fd5e68b4dec40ca0cd2db66be84c02fe6404b696c396e3909079820f61');
    });

});