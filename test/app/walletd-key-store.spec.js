const assert = require('chai').assert,
    { WalletdCli } = require('factom'),
    { isValidPublicIdentityKey, isValidSecretIdentityKey, generateRandomIdentityKeyPair } = require('../../src/app/key-helpers'),
    FactomWalletdKeyStore = require('../../src/app/walletd-key-store');

const walletd = new WalletdCli();
const store = new FactomWalletdKeyStore();

describe('Factom identity management for applications', function () {

    const IDENTITY_KEYS_TO_REMOVE = [
        'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz',
        'idpub2Z2jmbQ4SnrpSYg7Eq9kJzDPcaeHYpqtkU32WU8fEHr386Kdtp'];

    before(async function () {
        await walletd.call('import-identity-keys', {
            keys: [
                { secret: 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4' },
                { secret: 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx' }
            ]
        });
    });

    after(async function () {
        await Promise.all(IDENTITY_KEYS_TO_REMOVE.map(pub => walletd.call('remove-identity-key', {
            public: pub
        })));
    });

    it('Should get secret identity key', async function () {
        assert.equal(await store.getSecretIdentityKey('idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS'), 'idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS');
        assert.equal(await store.getSecretIdentityKey('idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz'), 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4');
    });

    it('Should import key', async function () {
        const key1 = generateRandomIdentityKeyPair();
        IDENTITY_KEYS_TO_REMOVE.push(key1.public);

        const keys = await store.importIdentityKeys(key1.secret);
        assert.deepEqual(keys, [key1]);
        const fetched = await walletd.call('identity-key', { public: key1.public });
        assert.deepEqual(fetched, key1);
    });

    it('Should import multiple keys', async function () {
        const key1 = generateRandomIdentityKeyPair();
        const key2 = generateRandomIdentityKeyPair();
        IDENTITY_KEYS_TO_REMOVE.push(key1.public, key2.public);

        const keys = await store.importIdentityKeys([key1.secret, key2.secret]);
        assert.deepEqual(keys, [key1, key2]);
        const fetched1 = await walletd.call('identity-key', { public: key1.public });
        const fetched2 = await walletd.call('identity-key', { public: key2.public });
        assert.deepEqual(fetched1, key1);
        assert.deepEqual(fetched2, key2);
    });

    it('Should get all identity keys', async function () {

        const keys = await store.getAllIdentityKeys();
        assert.isArray(keys);
        assert.isAtLeast(keys.length, 2);
        assert.includeDeepMembers(keys, [
            { public: 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz', secret: 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4' },
            { public: 'idpub2Z2jmbQ4SnrpSYg7Eq9kJzDPcaeHYpqtkU32WU8fEHr386Kdtp', secret: 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx' }
        ]);
    });

    it('Should generate a key from seed', async function () {

        const keys = await store.generateIdentityKey();
        assert.isArray(keys);
        assert.lengthOf(keys, 1);
        await store.removeIdentityKeys(keys.map(k => k.public));
    });

    it('Should generate keys from seed', async function () {

        const keys = await store.generateIdentityKey(3);
        assert.isArray(keys);
        assert.lengthOf(keys, 3);
        assert.notDeepEqual(keys[0], keys[1]);
        await store.removeIdentityKeys(keys.map(k => k.public));
    });

    it('Should remove an identity key', async function () {
        const key1 = generateRandomIdentityKeyPair();

        await walletd.call('import-identity-keys', {
            keys: [
                { secret: key1.secret }
            ]
        });

        await store.removeIdentityKeys(key1.public);
        try {
            await walletd.call('identity-key', { public: key1.public });
        } catch (e) {
            return e;
        }
        throw new Error('Should have thrown');
    });

    it('Should remove multiple keys', async function () {
        const key1 = generateRandomIdentityKeyPair();
        const key2 = generateRandomIdentityKeyPair();

        await walletd.call('import-identity-keys', {
            keys: [
                { secret: key1.secret },
                { secret: key2.secret }
            ]
        });

        await store.removeIdentityKeys([key1.public, key2.secret]);
        try {
            await walletd.call('identity-key', { public: key2.public });
        } catch (e) {
            return e;
        }
        throw new Error('Should have thrown');
    });

});
