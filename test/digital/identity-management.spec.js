const assert = require('chai').assert,
    { FactomCli } = require('factom'),
    { isValidPublicIdentityKey, isValidSecretIdentityKey, generateRandomIdentityKeyPair } = require('../../src/digital/key-helpers'),
    { getSecretIdentityKey,
        getActivePublicIdentityKeys,
        importIdentityKeys,
        isIdentityKeyActive,
        getAllIdentityKeys,
        createIdentity,
        generateIdentityKeyFromWalletSeed,
        removeIdentityKeys,
        replaceIdentityKey } = require('../../src/digital/identity-management');

require('dotenv').config();
const cli = new FactomCli({ host: process.env.FACTOM_HOST });

describe('Factom digital identity management', function () {

    const IDENTITY_KEYS_TO_REMOVE = [
        'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz',
        'idpub2Z2jmbQ4SnrpSYg7Eq9kJzDPcaeHYpqtkU32WU8fEHr386Kdtp'];

    before(async function () {
        await cli.walletdApi('import-identity-keys', {
            keys: [
                { secret: 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4' },
                { secret: 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx' }
            ]
        });
    });

    after(async function () {
        await Promise.all(IDENTITY_KEYS_TO_REMOVE.map(pub => cli.walletdApi('remove-identity-key', {
            public: pub
        })));
    });

    it('Should get secret identity key', async function () {
        assert.equal(await getSecretIdentityKey(cli, 'idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS'), 'idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS');
        assert.equal(await getSecretIdentityKey(cli, 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz'), 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4');
    });

    it('Should get active public identity keys', async function () {
        this.timeout(10000);
        const keysAtHeight = await getActivePublicIdentityKeys(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 58499);
        assert.deepEqual(keysAtHeight, ['idpub2kVac9L6ZiS91RrEoEfQrJGpcEoJJcGUyYE8zaq4gDB7VDhSjR', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo']);

        const keys = await getActivePublicIdentityKeys(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42');
        assert.deepEqual(keys, ['idpub2kVac9L6ZiS91RrEoEfQrJGpcEoJJcGUyYE8zaq4gDB7VDhSjR', 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz']);
    });

    it('Should check if key is active', async function () {
        this.timeout(10000);

        assert.isTrue(await isIdentityKeyActive(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo', 58499));
        assert.isFalse(await isIdentityKeyActive(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo'));
        assert.isTrue(await isIdentityKeyActive(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2kVac9L6ZiS91RrEoEfQrJGpcEoJJcGUyYE8zaq4gDB7VDhSjR'));
    });

    it('Should create identity with new random keys', async function () {
        this.timeout(10000);
        const { identityKeys } = await createIdentity(cli,
            ['factom-identity-lib', 'new-identity', Math.random().toString(), Math.random().toString()],
            3,
            process.env.EC_PRIVATE_KEY);

        assert.lengthOf(identityKeys, 3);
        assert.isTrue(isValidPublicIdentityKey(identityKeys[0].public));
        assert.isTrue(isValidSecretIdentityKey(identityKeys[0].secret));
    });

    it('Should create identity with new keys from wallet seed', async function () {
        this.timeout(10000);
        const { identityKeys } = await createIdentity(cli,
            ['factom-identity-lib', 'new-identity', Math.random().toString(), Math.random().toString()],
            3,
            process.env.EC_PRIVATE_KEY,
            { fromWalletSeed: true });

        assert.lengthOf(identityKeys, 3);
        assert.isTrue(isValidPublicIdentityKey(identityKeys[0].public));
        assert.isTrue(isValidSecretIdentityKey(identityKeys[0].secret));
        await removeIdentityKeys(cli, identityKeys.map(k => k.public));

    });

    it('Should create identity with existing keys', async function () {
        this.timeout(10000);
        const { identityKeys } = await createIdentity(cli,
            ['factom-identity-lib', 'new-identity', Math.random().toString(), Math.random().toString()],
            ['idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx', 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz'],
            process.env.EC_PRIVATE_KEY);

        assert.lengthOf(identityKeys, 2);
        assert.equal(identityKeys[0].public, 'idpub2Z2jmbQ4SnrpSYg7Eq9kJzDPcaeHYpqtkU32WU8fEHr386Kdtp');
        assert.equal(identityKeys[0].secret, 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx');
        assert.equal(identityKeys[1].public, 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz');
        assert.equal(identityKeys[1].secret, 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4');
    });

    xit('Should rotate identity keys', async function () {
        this.timeout(2000);

        await replaceIdentityKey(cli,
            '3a29ccb493e4f007fd4982a00bf271aede096ce052093d418749fc411e4fc6c5', {
                oldIdKey: 'idpub2yZ9s1Cnm42pvaqyMMxDsWC8RgccSr211Jdy4r8AXcG9b3Eb7a',
                newIdKey: 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz',
                signingIdKey: 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx',
            }, process.env.EC_PRIVATE_KEY);
    });

    it('Should import key', async function () {
        const key1 = generateRandomIdentityKeyPair();
        IDENTITY_KEYS_TO_REMOVE.push(key1.public);

        const keys = await importIdentityKeys(cli, key1.secret);
        assert.deepEqual(keys, [key1]);
        const fetched = await cli.walletdApi('identity-key', { public: key1.public });
        assert.deepEqual(fetched, key1);
    });

    it('Should import multiple keys', async function () {
        const key1 = generateRandomIdentityKeyPair();
        const key2 = generateRandomIdentityKeyPair();
        IDENTITY_KEYS_TO_REMOVE.push(key1.public, key2.public);

        const keys = await importIdentityKeys(cli, [key1.secret, key2.secret]);
        assert.deepEqual(keys, [key1, key2]);
        const fetched1 = await cli.walletdApi('identity-key', { public: key1.public });
        const fetched2 = await cli.walletdApi('identity-key', { public: key2.public });
        assert.deepEqual(fetched1, key1);
        assert.deepEqual(fetched2, key2);
    });

    it('Should get all identity keys', async function () {

        const keys = await getAllIdentityKeys(cli);
        assert.isArray(keys);
        assert.isAtLeast(keys.length, 2);
        assert.includeDeepMembers(keys, [
            { public: 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz', secret: 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4' },
            { public: 'idpub2Z2jmbQ4SnrpSYg7Eq9kJzDPcaeHYpqtkU32WU8fEHr386Kdtp', secret: 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx' }
        ]);
    });

    it('Should generate a key from seed', async function () {

        const keys = await generateIdentityKeyFromWalletSeed(cli);
        assert.isArray(keys);
        assert.lengthOf(keys, 1);
        await removeIdentityKeys(cli, keys.map(k => k.public));
    });

    it('Should generate keys from seed', async function () {

        const keys = await generateIdentityKeyFromWalletSeed(cli, 3);
        assert.isArray(keys);
        assert.lengthOf(keys, 3);
        assert.notDeepEqual(keys[0], keys[1]);
        await removeIdentityKeys(cli, keys.map(k => k.public));
    });

    it('Should remove an identity key', async function () {
        const key1 = generateRandomIdentityKeyPair();

        await cli.walletdApi('import-identity-keys', {
            keys: [
                { secret: key1.secret }
            ]
        });

        await removeIdentityKeys(cli, key1.public);
        try {
            await cli.walletdApi('identity-key', { public: key1.public });
        } catch (e) {
            return e;
        }
        throw new Error('Should have thrown');
    });

    it('Should remove multiple keys', async function () {
        const key1 = generateRandomIdentityKeyPair();
        const key2 = generateRandomIdentityKeyPair();

        await cli.walletdApi('import-identity-keys', {
            keys: [
                { secret: key1.secret },
                { secret: key2.secret }
            ]
        });

        await removeIdentityKeys(cli, [key1.public, key2.secret]);
        try {
            await cli.walletdApi('identity-key', { public: key2.public });
        } catch (e) {
            return e;
        }
        throw new Error('Should have thrown');
    });

});
