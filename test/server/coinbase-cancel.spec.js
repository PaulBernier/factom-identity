const assert = require('chai').assert;
const coinbaseCancel = require('../../src/server/coinbase-cancel');

describe('Coinbase cancel', function() {
    it('should generate coinbase cancel entry', function() {
        const entry = coinbaseCancel.generateCoinbaseCancelEntry(
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
            200000,
            5,
            'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk'
        );

        assert.equal(
            entry.chainId.toString('hex'),
            '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584'
        );
        assert.equal(entry.extIds[0].toString('hex'), '00');
        assert.equal(entry.extIds[1].toString('hex'), '436f696e626173652043616e63656c');
        assert.equal(
            entry.extIds[2].toString('hex'),
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762'
        );
        assert.equal(entry.extIds[3].toString('hex'), '00030d40');
        assert.equal(entry.extIds[4].toString('hex'), '00000005');
        assert.equal(
            entry.extIds[5].toString('hex'),
            '0125b0e7fd5e68b4dec40ca0cd2db66be84c02fe6404b696c396e3909079820f61'
        );
        assert.equal(
            entry.extIds[6].toString('hex'),
            '68c06b195771f801ff216c0ba98de485e54410c0765d662118aac389e319dcfdee12d11915206ab7d35f6f028584406156840fc30219111750bb1b0bc2b06106'
        );
    });
});
