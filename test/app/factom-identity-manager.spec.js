const assert = require('chai').assert,
    { isValidPublicIdentityKey, isValidSecretIdentityKey } = require('../../src/app/key-helpers'),
    FactomIdentityManager = require('../../src/app/factom-identity-manager');

require('dotenv').config();
const manager = new FactomIdentityManager({ host: process.env.FACTOM_HOST });

describe('Factom identity management for applications', function () {

    xit('Should get active public identity keys', async function () {
        this.timeout(10000);
        const keysAtHeight = await manager.getActivePublicIdentityKeys('e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 58499);
        assert.deepEqual(keysAtHeight, ['idpub2kVac9L6ZiS91RrEoEfQrJGpcEoJJcGUyYE8zaq4gDB7VDhSjR', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo']);

        const keys = await manager.getActivePublicIdentityKeys('e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42');
        assert.deepEqual(keys, ['idpub2kVac9L6ZiS91RrEoEfQrJGpcEoJJcGUyYE8zaq4gDB7VDhSjR', 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz']);
    });

    xit('Should check if key is active', async function () {
        this.timeout(10000);

        assert.isTrue(await manager.isIdentityKeyActive('e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo', 58499));
        assert.isFalse(await manager.isIdentityKeyActive('e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2pjBQgLnCcmoMWTZzqBQ2ShSEM4hJZNQZ1MJNtyhgBCrPBD7eo'));
        assert.isTrue(await manager.isIdentityKeyActive('e522a08e1697fd58c8d83fc72ceecc1efd8b8f12620e9f186d528f6e66ef6d42', 'idpub2kVac9L6ZiS91RrEoEfQrJGpcEoJJcGUyYE8zaq4gDB7VDhSjR'));
    });

    it('Should create identity with new random keys', async function () {
        this.timeout(10000);
        const { identityKeys } = await manager.createIdentity(
            ['factom-identity-lib', 'new-identity', Math.random().toString(), Math.random().toString()],
            3,
            process.env.EC_PRIVATE_KEY);

        assert.lengthOf(identityKeys, 3);
        assert.isTrue(isValidPublicIdentityKey(identityKeys[0].public));
        assert.isTrue(isValidSecretIdentityKey(identityKeys[0].secret));
    });

    it('Should create identity with existing keys', async function () {
        this.timeout(10000);
        const { identityKeys } = await manager.createIdentity(
            ['factom-identity-lib', 'new-identity', Math.random().toString(), Math.random().toString()],
            ['idpub2Z2jmbQ4SnrpSYg7Eq9kJzDPcaeHYpqtkU32WU8fEHr386Kdtp', 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz'],
            process.env.EC_PRIVATE_KEY);

        assert.lengthOf(identityKeys, 2);
        assert.equal(identityKeys[0].public, 'idpub2Z2jmbQ4SnrpSYg7Eq9kJzDPcaeHYpqtkU32WU8fEHr386Kdtp');
        assert.isUndefined(identityKeys[0].secret);
        assert.equal(identityKeys[1].public, 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz');
        assert.isUndefined(identityKeys[1].secret);
    });

    xit('Should rotate identity keys', async function () {
        this.timeout(2000);

        await manager.replaceIdentityKey(
            '3a29ccb493e4f007fd4982a00bf271aede096ce052093d418749fc411e4fc6c5', {
                oldIdKey: 'idpub2yZ9s1Cnm42pvaqyMMxDsWC8RgccSr211Jdy4r8AXcG9b3Eb7a',
                newIdKey: 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz',
                signingIdKey: 'idsec2CBtQMFqeMUdMQvDeXX91Aek8xLG8CfpeXnVBZkn8qVKvSqDkx',
            }, process.env.EC_PRIVATE_KEY);
    });
});
