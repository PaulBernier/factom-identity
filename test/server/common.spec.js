const assert = require('chai').assert;
const common = require('../../src/server/common');

describe('Common', function () {

    it('should extract secret from human readable encoded key', function () {
        assert.equal(
            common.extractSecretFromIdentityKey('sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk').toString('hex'),
            'f84a80f204c8e5e4369a80336919f55885d0b093505d84b80d12f9c08b81cd5e');
        assert.equal(
            common.extractSecretFromIdentityKey('sk22UaDys2Mzg2pUCsToo9aKgxubJFnZN5Bc2LXfV59VxMvXXKwXa').toString('hex'),
            '2bb967a78b081fafef17818c2a4c2ba8dbefcd89664ff18f6ba926b55e00b601');
        assert.equal(
            common.extractSecretFromIdentityKey('sk32Xyo9kmjtNqRUfRd3ZhU56NZd8M1nR61tdBaCLSQRdhUCk4yiM').toString('hex'),
            '09d51ae7cc0dbc597356ab1ada078457277875c81989c5db0ae6f4bf86ccea5f');
        assert.equal(
            common.extractSecretFromIdentityKey('sk43eMusQuvvChoGNn1VZZwbAH8BtKJSZNC7ZWoz1Vc4Y3greLA45').toString('hex'),
            '72644033bdd70b8fec7aa1fea50b0c5f7dfadb1bce76aa15d9564bf71c62b160');
    });

    it('should extract secret from hex encoded key', function () {
        assert.equal(
            common.extractSecretFromIdentityKey('4db6c9000000000000000000000000000000000000000000000000000000000000000055e5be09').toString('hex'),
            '0000000000000000000000000000000000000000000000000000000000000000');
    });

    it('should extract same secret from human readable encoding and hex encoding', function () {
        assert.equal(
            common.extractSecretFromIdentityKey('sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU').toString('hex'),
            common.extractSecretFromIdentityKey('4db6c9000000000000000000000000000000000000000000000000000000000000000055e5be09').toString('hex'));
    });

});