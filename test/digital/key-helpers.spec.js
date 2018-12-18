const assert = require('chai').assert,
    { isValidIdentityKey,
        isValidPublicIdentityKey,
        isValidSecretIdentityKey,
        getPublicIdentityKey,
        extractCryptoMaterial,
        keyToPublicIdentityKey,
        seedToSecretIdentityKey,
        generateRandomIdentityKeyPair } = require('../../src/digital/key-helpers');

describe('Factom digital identity keys', function () {

    it('Should validate identity key', function () {
        assert.isTrue(isValidIdentityKey('idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w'));
        assert.isTrue(isValidIdentityKey('idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS'));
        assert.isFalse(isValidIdentityKey('idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbK'));
    });

    it('Should validate public identity key', function () {
        assert.isTrue(isValidPublicIdentityKey('idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w'));
        assert.isTrue(isValidPublicIdentityKey('idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz'));
        assert.isFalse(isValidPublicIdentityKey('idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS'));
    });

    it('Should validate secret identity key', function () {
        assert.isTrue(isValidSecretIdentityKey('idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS'));
        assert.isTrue(isValidSecretIdentityKey('idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4'));
        assert.isFalse(isValidSecretIdentityKey('idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w'));
    });

    it('Should get public identity key', function () {
        assert.equal(getPublicIdentityKey('idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4'), 'idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz');
        assert.equal(getPublicIdentityKey('idsec2Vn3VT8FdE1YpcDms8zSvXR4DGzQeMMdeLRP2RbMCSWCFoQDbS'), 'idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w');
        assert.equal(getPublicIdentityKey('idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w'), 'idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w');
    });

    it('Should extract crypto material', function () {
        assert.deepEqual(extractCryptoMaterial('idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4'), Buffer.from('67fe571d8cbad2c0d0d10b295301eaf631d43ff82f21c7f161448f220ad22c66','hex'));
        assert.deepEqual(extractCryptoMaterial('idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w'), Buffer.from('765017f7b51708e0e5e6b373ed8258dc2ad91d6370b60dca4be2d08f013439a2', 'hex'));
    });

    it('Should convert key to public identity key', function () {
        assert.equal(keyToPublicIdentityKey('765017f7b51708e0e5e6b373ed8258dc2ad91d6370b60dca4be2d08f013439a2'), 'idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w');
    });

    it('Should convert seed to secret identity key', function () {
        assert.equal(seedToSecretIdentityKey('67fe571d8cbad2c0d0d10b295301eaf631d43ff82f21c7f161448f220ad22c66'), 'idsec1wnZ9FLheMDXZNnnDHXdqZcMiDrgg2hTNzdseNLwFnEot362c4');
    });

    it('Should convert seed to secret identity key', function () {
        const keyPair = generateRandomIdentityKeyPair();
        assert.isTrue(isValidPublicIdentityKey(keyPair.public));
        assert.isTrue(isValidSecretIdentityKey(keyPair.secret));
    });

});