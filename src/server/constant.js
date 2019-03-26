const VERSION_0 = Buffer.alloc(1);

const SERVER_IDENTITY_KEY_PREFIXES = new Set([
    'sk1',
    'sk2',
    'sk3',
    'sk4',
    'id1',
    'id2',
    'id3',
    'id4'
]);
const SERVER_IDENTITY_KEY_HEX_PREFIX_MAP = {
    sk1: '4db6c9',
    sk2: '4db6e7',
    sk3: '4db705',
    sk4: '4db723',
    id1: '3fbeba',
    id2: '3fbed8',
    id3: '3fbef6',
    id4: '3fbf14'
};

module.exports = {
    VERSION_0,
    SERVER_IDENTITY_KEY_HEX_PREFIX_MAP,
    SERVER_IDENTITY_KEY_PREFIXES
};
