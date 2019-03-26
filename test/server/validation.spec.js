const assert = require('chai').assert;
const validation = require('../../src/server/validation');

describe('Validation', function() {
    it('should validate sk1 keys', function() {
        assert.isTrue(
            validation.isValidSk1('sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk')
        );
        assert.isTrue(
            validation.isValidSk1(
                '4db6c95a0ef559e4fc1cd5f2e623aa71fff22c14d540c280f1b1c876e8ccfe2677116e325d512d'
            )
        );
        assert.isTrue(
            validation.isValidSk1(
                '4db6c9000000000000000000000000000000000000000000000000000000000000000055e5be09'
            )
        );
    });

    it('should validate sk2 keys', function() {
        assert.isTrue(
            validation.isValidSk2('sk229KM7j76STogyvuoDSWn8rvT6bRB1VoSMHgC5KD8W88E26iQM3')
        );
    });

    it('should validate sk3 keys', function() {
        assert.isTrue(
            validation.isValidSk3('sk32Tee5C4fCkbjbN4zc4VPkr9vX4xg8n53XQuWZx6xAKm2cAP7gv')
        );
    });

    it('should validate sk4 keys', function() {
        assert.isTrue(
            validation.isValidSk4('sk42myw2f2Dy3PnCoEBzgU1NqPPwYWBG4LehY8q4azmpXPqGY6Bqu')
        );
    });

    it('should validate any kind of keys', function() {
        assert.isTrue(
            validation.isValidIdentityKey('sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk')
        );
        assert.isTrue(
            validation.isValidIdentityKey('sk229KM7j76STogyvuoDSWn8rvT6bRB1VoSMHgC5KD8W88E26iQM3')
        );
        assert.isTrue(
            validation.isValidIdentityKey('sk32Tee5C4fCkbjbN4zc4VPkr9vX4xg8n53XQuWZx6xAKm2cAP7gv')
        );
        assert.isTrue(
            validation.isValidIdentityKey('sk42myw2f2Dy3PnCoEBzgU1NqPPwYWBG4LehY8q4azmpXPqGY6Bqu')
        );
        assert.isTrue(
            validation.isValidIdentityKey('id11qFJ7fe26N29hrY3f1gUQC7UYArUg2GEy1rpPp2ExbnJdSj3mN')
        );
        assert.isTrue(
            validation.isValidIdentityKey('id229ab58barepCKHhF3df62BLwxePyoJXr9968tSv4coR7LbtoFL')
        );
        assert.isTrue(
            validation.isValidIdentityKey('id32Tut2bZ9cwcEvirSSFdheAaRP7wUvaoTKGKTP5otH13uzjcHTd')
        );
        assert.isTrue(
            validation.isValidIdentityKey('id42nFAz4WiPEQHYA1dpscKG9otobUz3s54VPYmsihhwCgibnEPW5')
        );
    });

    it('should validate subset of keys', function() {
        const prefixes = ['id2', 'sk1'];
        assert.isTrue(
            validation.isValidIdentityKey(
                'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk',
                prefixes
            )
        );
        assert.isFalse(
            validation.isValidIdentityKey(
                'sk229KM7j76STogyvuoDSWn8rvT6bRB1VoSMHgC5KD8W88E26iQM3',
                prefixes
            )
        );
        assert.isFalse(
            validation.isValidIdentityKey(
                'sk32Tee5C4fCkbjbN4zc4VPkr9vX4xg8n53XQuWZx6xAKm2cAP7gv',
                prefixes
            )
        );
        assert.isFalse(
            validation.isValidIdentityKey(
                'sk42myw2f2Dy3PnCoEBzgU1NqPPwYWBG4LehY8q4azmpXPqGY6Bqu',
                prefixes
            )
        );
        assert.isFalse(
            validation.isValidIdentityKey(
                'id11qFJ7fe26N29hrY3f1gUQC7UYArUg2GEy1rpPp2ExbnJdSj3mN',
                prefixes
            )
        );
        assert.isTrue(
            validation.isValidIdentityKey(
                'id229ab58barepCKHhF3df62BLwxePyoJXr9968tSv4coR7LbtoFL',
                prefixes
            )
        );
        assert.isFalse(
            validation.isValidIdentityKey(
                'id32Tut2bZ9cwcEvirSSFdheAaRP7wUvaoTKGKTP5otH13uzjcHTd',
                prefixes
            )
        );
        assert.isFalse(
            validation.isValidIdentityKey(
                'id42nFAz4WiPEQHYA1dpscKG9otobUz3s54VPYmsihhwCgibnEPW5',
                prefixes
            )
        );
    });
});
