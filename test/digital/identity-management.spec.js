const assert = require('chai').assert,
    { FactomCli } = require('factom'),
    { isValidPublicIdentityKey, isValidSecretIdentityKey } = require('../../src/digital/key-helpers'),
    { getSecretIdentityKey,
        getActivePublicIdentityKeys,
        isIdentityKeyActive,
        createIdentity,
        replaceIdentityKey } = require('../../src/digital/identity-management');

require('dotenv').config();
const cli = new FactomCli({ host: process.env.FACTOM_HOST });

describe('Factom digital identity management', function () {

    before(async function () {
        await cli.walletdApi('import-identity-keys', {
            keys: [
                { secret: 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4' },
                { secret: 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx' }
            ]
        });
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

    it('Should get active public identity keys', async function () {
        this.timeout(10000);

        assert.isTrue(await isIdentityKeyActive(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo', 58499));
        assert.isFalse(await isIdentityKeyActive(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo'));
        assert.isTrue(await isIdentityKeyActive(cli, 'e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2kVac9L6ZiS91RrEoEfQrJGpcEoJJcGUyYE8zaq4gDB7VDhSjR'));
    });

    it('Should create identity with new keys', async function () {
        this.timeout(5000);
        const { identityKeys } = await createIdentity(cli,
            ['factom-identity-lib', 'new-identity', Math.random().toString(), Math.random().toString()],
            3,
            process.env.EC_PRIVATE_KEY);

        assert.lengthOf(identityKeys, 3);
        assert.isTrue(isValidPublicIdentityKey(identityKeys[0].public));
        assert.isTrue(isValidSecretIdentityKey(identityKeys[0].secret));
    });

    it('Should create identity with existing keys', async function () {
        this.timeout(5000);
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

});
