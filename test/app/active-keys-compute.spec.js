const assert = require('chai').assert,
    sinon = require('sinon'),
    { randomBytes } = require('crypto'),
    { FactomCli, Entry } = require('factom'),
    { generateRandomIdentityKeyPair } = require('../../src/app/key-helpers'),
    { generateIdentityChain, generateIdentityKeyReplacementEntry } = require('../../src/app/identity-struct'),
    { getActiveKeysAtHeight } = require('../../src/app/active-keys-compute');


describe('Compute active keys at block height', function () {

    it('Should get initial set of keys', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialPublicKeys = getRandomKeys().map(k => k.public);
        const entries = [[getIdentityFirstEntry(initialPublicKeys)]];
        const blockContexts = getBlockContexts([[1]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        assert.deepStrictEqual(activeKeys, initialPublicKeys);
    });

    it('Should handle 2 key rotations in the same block', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const newPublicIdKey2 = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[1], newPublicIdKey, initialKeys[0]);
        const replacement2 = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey2, initialKeys[0]);

        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement, replacement2]];
        const blockContexts = getBlockContexts([[1, 5, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const keys = await getActiveKeysAtHeight(cli, chainId, 8);

        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[1] = newPublicIdKey;
        rotatedKeys[2] = newPublicIdKey2;
        assert.deepStrictEqual(keys, rotatedKeys);
    });

    it('Should ignore garbage entry', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const garbage = Entry.builder().extId('ReplaceKey', 'utf8').build();
        const entries = [[getIdentityFirstEntry(initialPublicKeys), garbage]];
        const blockContexts = getBlockContexts([[1, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        assert.deepStrictEqual(activeKeys, initialPublicKeys);
    });

    it('Should throw if chain did not exist at height', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialPublicKeys = getRandomKeys().map(k => k.public);
        const entries = [[getIdentityFirstEntry(initialPublicKeys)]];
        const blockContexts = getBlockContexts([[100]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        try {
            await getActiveKeysAtHeight(cli, chainId, 10);
        } catch (e) {
            return assert.instanceOf(e, Error);
        }
        throw new Error('Should have thrown');
    });

    it('Should throw if chain is not an identity chain', async function () {
        const chainId = randomBytes(32).toString('hex');
        const entries = [[Entry.builder().content('random entry', 'utf8').build()]];
        const blockContexts = getBlockContexts([[[1]]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        try {
            await getActiveKeysAtHeight(cli, chainId, 99999);
        } catch (e) {
            return assert.instanceOf(e, Error);
        }
        throw new Error('Should have thrown');
    });

    it('Should get keys after key rotation', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[1]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement]];
        const blockContexts = getBlockContexts([[1, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[2] = newPublicIdKey;
        assert.deepStrictEqual(activeKeys, rotatedKeys);
    });

    it('Should get keys before key rotation', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[1]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement]];
        const blockContexts = getBlockContexts([[1, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 3);

        assert.deepStrictEqual(activeKeys, initialPublicKeys);
    });

    it('Should accept key rotation with the same priority', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[2]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement]];
        const blockContexts = getBlockContexts([[1, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[2] = newPublicIdKey;
        assert.deepStrictEqual(activeKeys, rotatedKeys);
    });

    it('Should not take into account reuse of an existing key', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const replacement1 = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[0]);
        // Second rotation attempt to restore initialPublicKeys[2] in the active set, which is not allowed
        const replacement2 = generateIdentityKeyReplacementEntry(chainId, newPublicIdKey, initialPublicKeys[2], initialKeys[0]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement1, replacement2]];
        const blockContexts = getBlockContexts([[1, 5, 12]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[2] = newPublicIdKey;
        assert.deepStrictEqual(activeKeys, rotatedKeys);
    });

    it('Should fail to rotate non active key', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const newPublicIdKey2 = getRandomKeys(1)[0].public;
        const replacement1 = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[0]);
        // Second rotation attempt to rotate initialPublicKeys[2] key which is not in the active set anymore
        const replacement2 = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey2, initialKeys[0]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement1, replacement2]];
        const blockContexts = getBlockContexts([[1, 5, 12]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[2] = newPublicIdKey;
        assert.deepStrictEqual(activeKeys, rotatedKeys);
    });

    it('Should not take into account key rotation by a lower priority key', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[1], newPublicIdKey, initialKeys[2]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement]];
        const blockContexts = getBlockContexts([[1, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        assert.deepStrictEqual(activeKeys, initialPublicKeys);
    });

    it('Should not take into account key rotation with a non valid key', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[1], 'not an actual key', initialKeys[0]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement]];
        const blockContexts = getBlockContexts([[1, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        assert.deepStrictEqual(activeKeys, initialPublicKeys);
    });

    it('Should not take into account key rotation with invalid signature', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;

        const replacement = Entry.builder()
            .chainId(chainId)
            .extId('ReplaceKey', 'utf8')
            .extId(initialPublicKeys[2], 'utf8')
            .extId(newPublicIdKey, 'utf8')
            .extId(randomBytes(64))
            .extId(initialKeys[0].public, 'utf8')
            .build();

        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement]];
        const blockContexts = getBlockContexts([[1, 5]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        const activeKeys = await getActiveKeysAtHeight(cli, chainId, 99999);

        assert.deepStrictEqual(activeKeys, initialPublicKeys);
    });

    it('Should get cached keys', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const newPublicIdKey2 = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[0]);
        const replacement2 = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[1], newPublicIdKey2, initialKeys[0]);
        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement, replacement2]];
        const blockContexts = getBlockContexts([[1, 5, 10]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        await getActiveKeysAtHeight(cli, chainId, 99999);
        // Now get keys from the cache
        const set1 = await getActiveKeysAtHeight(cli, chainId, 1);
        const set2 = await getActiveKeysAtHeight(cli, chainId, 3);
        const set3 = await getActiveKeysAtHeight(cli, chainId, 5);
        const set4 = await getActiveKeysAtHeight(cli, chainId, 7);
        const set5 = await getActiveKeysAtHeight(cli, chainId, 10);

        assert.deepStrictEqual(set1, initialPublicKeys);
        assert.deepStrictEqual(set2, initialPublicKeys);
        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[2] = newPublicIdKey;
        assert.deepStrictEqual(set4, rotatedKeys);
        assert.deepStrictEqual(set3, rotatedKeys);
        const rotatedKeys2 = [...rotatedKeys];
        rotatedKeys2[1] = newPublicIdKey2;
        assert.deepStrictEqual(set5, rotatedKeys2);
    });

    it('Should get fetch keys missing from cache', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const newPublicIdKey2 = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[0]);
        const replacement2 = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[1], newPublicIdKey2, initialKeys[0]);

        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement], [replacement, replacement2]];
        const blockContexts = getBlockContexts([[1, 5], [5, 10]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        await getActiveKeysAtHeight(cli, chainId, 8);
        // Now get keys from the cache + fetch the last entry missing (replacement2)
        const set = await getActiveKeysAtHeight(cli, chainId, 11);

        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[2] = newPublicIdKey;
        rotatedKeys[1] = newPublicIdKey2;
        assert.deepStrictEqual(set, rotatedKeys);
    });

    // TODO: remove after optimization
    it('Should get fetch keys missing from cache', async function () {
        const chainId = randomBytes(32).toString('hex');
        const initialKeys = getRandomKeys();
        const initialPublicKeys = initialKeys.map(k => k.public);
        const newPublicIdKey = getRandomKeys(1)[0].public;
        const newPublicIdKey2 = getRandomKeys(1)[0].public;
        const replacement = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[2], newPublicIdKey, initialKeys[0]);
        const replacement2 = generateIdentityKeyReplacementEntry(chainId, initialPublicKeys[1], newPublicIdKey2, initialKeys[0]);

        const entries = [[getIdentityFirstEntry(initialPublicKeys), replacement, replacement2], [replacement, replacement2]];
        const blockContexts = getBlockContexts([[1, 5, 10], [5, 10]]);
        const cli = getMockedCli(chainId, entries, blockContexts);

        await getActiveKeysAtHeight(cli, chainId, 11);
        // Now get keys from the cache + fetch the last entry missing (replacement2)
        const set = await getActiveKeysAtHeight(cli, chainId, 11);

        const rotatedKeys = [...initialPublicKeys];
        rotatedKeys[2] = newPublicIdKey;
        rotatedKeys[1] = newPublicIdKey2;
        assert.deepStrictEqual(set, rotatedKeys);
    });

});

/********************
 * Helper functions
 ********************/

function getBlockContexts(heights) {
    return heights.map(a => a.map(h => ({ directoryBlockHeight: h })));
}

function getRandomKeys(n = 3) {
    return Array(n).fill('').map(() => generateRandomIdentityKeyPair());
}

function getIdentityFirstEntry(publicKeys) {
    return generateIdentityChain(['name'], publicKeys).firstEntry;
}

function getMockedCli(chainId, entries, blockContexts) {
    assert.strictEqual(entries.length, blockContexts.length);
    entries.forEach((e, i) => e.length === blockContexts[i].length);

    const cli = new FactomCli();
    const mock = sinon.mock(cli);

    const stub = mock.expects('rewindChainWhile')
        .exactly(entries.length)
        .withArgs(chainId);

    for (let j = 0; j < entries.length; ++j) {
        stub.onCall(j)
            .callsFake(async function (chainId, condition, f) {
                for (let i = entries[j].length - 1; i >= 0; --i) {
                    const b = await condition(Entry.builder(entries[j][i]).blockContext(blockContexts[j][i]).build());
                    if (b) {
                        await f(Entry.builder(entries[j][i]).blockContext(blockContexts[j][i]).build());
                    }
                }
            });
    }

    return cli;
}