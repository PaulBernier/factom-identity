const { sha256d, verify } = require('./crypto');
const { VERSION_0 } = require('./constant');

async function getIdentityRootChain(cli, rootChainId) {

    const entries = await cli.getAllEntriesOfChain(rootChainId);

    const extIds = entries[0].extIds;
    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Identity Chain' ||
        extIds.length !== 7) {
        throw new Error('Invalid Root Factom Identity Chain');
    }

    const identityKeys = extractIdentityKeys(entries[0]);
    const serverManagementSubchainId = extractServerManagementSubchainId(entries, identityKeys);

    return { entries, identityKeys, serverManagementSubchainId };
}

async function getServerManagementSubchain(cli, serverManagementSubchainId, rootChainId) {
    const entries = await cli.getAllEntriesOfChain(serverManagementSubchainId);

    const extIds = entries[0].extIds;
    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Server Management' ||
        extIds.length !== 4) {
        throw new Error('Invalid Server Management Subchain');
    }

    if (rootChainId && rootChainId !== extIds[2].toString('hex')) {
        throw new Error('This Server Management Subchain doesn\'t reference the Identity Root Chain Id provided');
    }

    return { entries };
}

/////////////////// Extractors ///////////////////////

function extractIdentityKeys(entry) {
    const extIds = entry.extIds;
    return [extIds[2], extIds[3], extIds[4], extIds[5]];
}

function extractServerManagementSubchainId(entries, identityKeys) {

    const serverManagementSubchainEntry = entries.find(e => e.extIds[1].toString() === 'Register Server Management');

    verifyServerManagementSubchainRegistration(serverManagementSubchainEntry, identityKeys[0]);
    return serverManagementSubchainEntry.extIds[2];
}

function verifyServerManagementSubchainRegistration(entry, identityKey1) {
    const extIds = entry.extIds;

    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Register Server Management' ||
        extIds[2].length !== 32 ||
        !sha256d(extIds[3]).equals(identityKey1)) {
        throw new Error('Invalid Server Managemenet Subchain registration');
    }

    const data = Buffer.concat(extIds.slice(0, 3));

    if (!verify(extIds[3], data, extIds[4])) {
        throw new Error('Invalid signature of the Server Managemenet Subchain registration');
    }
}

module.exports = {
    getIdentityRootChain,
    getServerManagementSubchain
};
