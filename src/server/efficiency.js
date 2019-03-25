const { Entry, isValidEcAddress } = require('factom');
const { getIdentityRootChain } = require('./identity-chains');
const { isValidSk1, isValidServerIdentityChainId } = require('./validation');
const { getNowTimestamp8BytesBuffer } = require('./common');
const { verify, extractSecretFromIdentityKey, sign } = require('./common');
const { sha256d, secretToPublicKey } = require('../crypto');
const { VERSION_0 } = require('./constant');

///////////////// Read /////////////////

function extract(rootChainId, managementEntries, identityKey1) {
    for (const entry of managementEntries.reverse()) {
        if (isValidEfficiencyRegistration(entry, rootChainId, identityKey1)) {
            return {
                registrationEntryHash: entry.hash().toString('hex'),
                registrationTimestamp: entry.blockContext.entryTimestamp,
                registrationDirectoryBlockHeight: entry.blockContext.directoryBlockHeight,
                efficiency: parseInt(entry.extIds[3].toString('hex'), 16) / 100
            };
        }
    }
}

function extractHistory(rootChainId, managementEntries, identityKey1) {
    return managementEntries
        .reverse()
        .filter(e => isValidEfficiencyRegistration(e, rootChainId, identityKey1))
        .map(e => ({
            registrationEntryHash: e.hash().toString('hex'),
            registrationTimestamp: e.blockContext.entryTimestamp,
            registrationDirectoryBlockHeight: e.blockContext.directoryBlockHeight,
            efficiency: parseInt(e.extIds[3].toString('hex'), 16) / 100
        }));
}

function isValidEfficiencyRegistration(entry, rootChainId, identityKey1) {
    const extIds = entry.extIds;

    if (
        extIds.length !== 7 ||
        !extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Server Efficiency' ||
        extIds[2].toString('hex') !== rootChainId ||
        extIds[3].length !== 2 ||
        !sha256d(extIds[5]).equals(identityKey1)
    ) {
        return false;
    }

    const data = Buffer.concat(extIds.slice(0, 5));

    if (!verify(extIds[5], data, extIds[6])) {
        return false;
    }

    return true;
}

///////////////// Update /////////////////

async function update(cli, rootChainId, efficiency, sk1, ecAddress) {
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (typeof efficiency !== 'number' || efficiency < 0 || efficiency > 100) {
        throw new Error('Efficiency must be a number between 0 and 100');
    }
    if (!isValidEcAddress(ecAddress)) {
        throw new Error(`Invalid EC address ${ecAddress}`);
    }

    const balance = await cli.getBalance(ecAddress);
    if (balance < 1) {
        throw new Error('Insufficient EC balance to pay for updating efficiency');
    }

    const rootChain = await getIdentityRootChain(cli, rootChainId);

    const identityKey = sha256d(
        Buffer.concat([
            Buffer.from('01', 'hex'),
            secretToPublicKey(extractSecretFromIdentityKey(sk1))
        ])
    );
    if (!rootChain.identityKeys[0].equals(identityKey)) {
        throw new Error(`The SK1 cannot sign in the Identity Root Chain ${rootChainId}`);
    }

    const entry = Entry.builder(
        getEfficiencyUpdateEntry(rootChainId, rootChain.serverManagementSubchainId, efficiency, sk1)
    ).build();
    return await cli.add(entry, ecAddress);
}

/**
 * Generate Entry object to update a server identity efficiency.
 * @memberof server
 * @function generateEfficiencyUpdateEntry
 * @param {string} rootChainId - Identity Root Chain Id.
 * @param {string} serverManagementSubchainId - Server Management Subchain Id.
 * @param {number} efficiency - Efficiency between 0 and 100.
 * @param {string} sk1 - Server identity Secret Key 1.
 * @returns {{chainId: Buffer, extIds: Buffer[], content: Buffer}}
 */
function generateUpdateEntry(rootChainId, serverManagementSubchainId, efficiency, sk1) {
    if (rootChainId === serverManagementSubchainId) {
        throw new Error(
            `The root chain id cannot be the same as the server management subchain id (${rootChainId})`
        );
    }
    if (!isValidServerIdentityChainId(rootChainId)) {
        throw new Error(`Invalid root chain id ${rootChainId}`);
    }
    if (!isValidServerIdentityChainId(serverManagementSubchainId)) {
        throw new Error(`Invalid server management subchain id ${serverManagementSubchainId}`);
    }
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (typeof efficiency !== 'number' || efficiency < 0 || efficiency > 100) {
        throw new Error('Efficiency must be a number between 0 and 100');
    }

    return getEfficiencyUpdateEntry(rootChainId, serverManagementSubchainId, efficiency, sk1);
}

function getEfficiencyUpdateEntry(rootChainId, serverManagementSubchainId, eff, sk1) {
    const version = Buffer.from('00', 'hex');
    const marker = Buffer.from('Server Efficiency', 'utf8');
    const chainId = Buffer.from(rootChainId, 'hex');

    let effHex = Math.round(eff * 100).toString('16');
    effHex = effHex.padStart(4, '0');
    const efficiency = Buffer.from(effHex, 'hex');
    const timestamp = getNowTimestamp8BytesBuffer();

    const dataToSign = Buffer.concat([version, marker, chainId, efficiency, timestamp]);
    const { identityKeyPreImage, signature } = sign(extractSecretFromIdentityKey(sk1), dataToSign);

    return {
        chainId: Buffer.from(serverManagementSubchainId, 'hex'),
        extIds: [version, marker, chainId, efficiency, timestamp, identityKeyPreImage, signature],
        content: Buffer.from('')
    };
}

module.exports = {
    update,
    extract,
    extractHistory,
    generateUpdateEntry
};
