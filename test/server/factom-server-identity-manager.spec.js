const assert = require('chai').assert,
    { FactomServerIdentityManager } = require('../../src/server');

const manager = new FactomServerIdentityManager({ host: process.env.FACTOM_HOST });

describe('Factom identity management for servers', function() {
    it('Should get server identity', async function() {
        this.timeout(10000);
        const result = await manager.getServerIdentity(
            '8888880fc082ace22b1dbe53609424071852f969afd19c54a1c7b30c65cbcbc4'
        );
        assert.isObject(result);
        assert.deepEqual(
            result.rootChainId,
            '8888880fc082ace22b1dbe53609424071852f969afd19c54a1c7b30c65cbcbc4'
        );
        assert.deepEqual(
            result.serverManagementSubchainId,
            '888888f63928be6e6d557fab6bb7253d778969d031cd189e1e620495bcf7272b'
        );
        assert.isObject(result.coinbaseAddress);
        assert.isObject(result.efficiency);
        assert.isArray(result.identityKeys);
    });

    it('Should get server identity history', async function() {
        this.timeout(10000);
        const result = await manager.getServerIdentityHistory(
            '8888880fc082ace22b1dbe53609424071852f969afd19c54a1c7b30c65cbcbc4'
        );
        assert.isObject(result);
        assert.deepEqual(
            result.rootChainId,
            '8888880fc082ace22b1dbe53609424071852f969afd19c54a1c7b30c65cbcbc4'
        );
        assert.deepEqual(
            result.serverManagementSubchainId,
            '888888f63928be6e6d557fab6bb7253d778969d031cd189e1e620495bcf7272b'
        );
        assert.isArray(result.coinbaseAddressHistory);
        assert.isArray(result.efficiencyHistory);
        assert.isArray(result.identityKeys);
    });
});
