const {
    Entry,
    isValidPublicFctAddress,
    isValidEcAddress,
    addressToRcdHash,
    rcdHashToPublicFctAddress
} = require('factom');
const { getIdentityRootChain } = require('./identity-chains');
const { getNowTimestamp8BytesBuffer } = require('./common');
const { verify, extractSecretFromIdentityKey, sign } = require('./common');
const { sha256d, secretToPublicKey } = require('../crypto');
const { isValidSk1, isValidServerIdentityChainId } = require('./validation');
const { VERSION_0 } = require('./constant');

///////////////// Read /////////////////

function extract(rootChainId, rootEntries, identityKey1) {
    for (const entry of rootEntries.reverse()) {
        if (isValidCoinbaseAddressRegistration(entry, rootChainId, identityKey1)) {
            return {
                registrationEntryHash: entry.hash().toString('hex'),
                registrationTimestamp: entry.blockContext.entryTimestamp,
                registrationDirectoryBlockHeight: entry.blockContext.directoryBlockHeight,
                address: rcdHashToPublicFctAddress(entry.extIds[3])
            };
        }
    }
}

function extractHistory(rootChainId, rootEntries, identityKey1) {
    return rootEntries
        .reverse()
        .filter(e => isValidCoinbaseAddressRegistration(e, rootChainId, identityKey1))
        .map(e => ({
            registrationEntryHash: e.hash().toString('hex'),
            registrationTimestamp: e.blockContext.entryTimestamp,
            registrationDirectoryBlockHeight: e.blockContext.directoryBlockHeight,
            address: rcdHashToPublicFctAddress(e.extIds[3])
        }));
}

function isValidCoinbaseAddressRegistration(entry, rootChainId, identityKey1) {
    const extIds = entry.extIds;

    if (
        extIds.length !== 7 ||
        !extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Coinbase Address' ||
        extIds[2].toString('hex') !== rootChainId ||
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

async function update(cli, rootChainId, fctAddress, sk1, ecAddress) {
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (!isValidPublicFctAddress(fctAddress)) {
        throw new Error(`Invalid public FCT address: ${fctAddress}`);
    }
    if (!isValidEcAddress(ecAddress)) {
        throw new Error(`Invalid EC address ${ecAddress}`);
    }

    const balance = await cli.getBalance(ecAddress);
    if (balance < 1) {
        throw new Error('Insufficient EC balance to pay for updating coinbase address');
    }

    const rootChain = await getIdentityRootChain(cli, rootChainId);

    const identityKey = sha256d(
        Buffer.concat([
            Buffer.from('01', 'hex'),
            secretToPublicKey(extractSecretFromIdentityKey(sk1))
        ])
    );
    if (!rootChain.identityKeys[0].equals(identityKey)) {
        throw new Error(
            `The SK1 key cannot sign entries in the Identity Root Chain ${rootChainId}`
        );
    }

    const entry = Entry.builder(
        getCoinbaseAddressUpdateEntry(rootChainId, fctAddress, sk1)
    ).build();
    return await cli.add(entry, ecAddress);
}

/**
 * Generate Entry object to update a server identity coinbase address.
 * @memberof server
 * @function generateCoinbaseAddressUpdateEntry
 * @param {string} rootChainId - Identity Root Chain Id.
 * @param {string} fctAddress - Public Factoid address to set as the new coinbase address.
 * @param {string} sk1 - Server identity Secret Key 1.
 * @returns {{{chainId: Buffer, extIds: Buffer[], content: Buffer}}}
 */
function generateUpdateEntry(rootChainId, fctAddress, sk1) {
    if (!isValidServerIdentityChainId(rootChainId)) {
        throw new Error(`Invalid root chain id ${rootChainId}`);
    }
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (!isValidPublicFctAddress(fctAddress)) {
        throw new Error(`Invalid public FCT address: ${fctAddress}`);
    }

    return getCoinbaseAddressUpdateEntry(rootChainId, fctAddress, sk1);
}

function getCoinbaseAddressUpdateEntry(rootChainId, fctAddress, sk1) {
    const version = Buffer.from('00', 'hex');
    const marker = Buffer.from('Coinbase Address', 'utf8');
    const chainId = Buffer.from(rootChainId, 'hex');
    const factoidAddress = addressToRcdHash(fctAddress);
    const timestamp = getNowTimestamp8BytesBuffer();

    const dataToSign = Buffer.concat([version, marker, chainId, factoidAddress, timestamp]);
    const { identityKeyPreImage, signature } = sign(extractSecretFromIdentityKey(sk1), dataToSign);

    return {
        chainId: chainId,
        extIds: [
            version,
            marker,
            chainId,
            factoidAddress,
            timestamp,
            identityKeyPreImage,
            signature
        ],
        content: Buffer.from('')
    };
}

module.exports = {
    update,
    extract,
    extractHistory,
    generateUpdateEntry
};
