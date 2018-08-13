const assert = require('chai').assert;
const validation = require('../src/validation');

describe('Validation', function () {

    it('should validate sk1 keys', function () {
        assert.isTrue(validation.isValidSk1('sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk'));
        assert.isTrue(validation.isValidSk1('4db6c95a0ef559e4fc1cd5f2e623aa71fff22c14d540c280f1b1c876e8ccfe2677116e325d512d'));
        assert.isTrue(validation.isValidSk1('4db6c9000000000000000000000000000000000000000000000000000000000000000055e5be09'));
    });

});