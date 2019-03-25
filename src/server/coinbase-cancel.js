const { Entry, isValidEcAddress } = require('factom');
const { sha256d, secretToPublicKey } = require('../crypto');
const { extractSecretFromIdentityKey, sign } = require('./common');
const { getIdentityRootChain } = require('./identity-chains');
const { isValidSk1, isValidServerIdentityChainId } = require('./validation');

async function add(cli, rootChainId, height, index, sk1, ecAddress) {
    if (!isValidEcAddress(ecAddress)) {
        throw new Error(`Invalid EC address ${ecAddress}`);
    }
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }

    const balance = await cli.getBalance(ecAddress);
    if (balance < 1) {
        throw new Error('Insufficient EC balance to pay for adding coinbase cancel entry');
    }

    const rootChain = await getIdentityRootChain(cli, rootChainId);

    const identityKey = sha256d(
        Buffer.concat([
            Buffer.from('01', 'hex'),
            secretToPublicKey(extractSecretFromIdentityKey(sk1))
        ])
    );
    if (!rootChain.identityKeys[0].equals(identityKey)) {
        throw new Error(`The SK1 key cannot sign in the Identity Root Chain ${rootChainId}`);
    }

    const entry = Entry.builder(
        generateCoinbaseCancelEntry(
            rootChainId,
            rootChain.serverManagementSubchainId.toString('hex'),
            height,
            index,
            sk1
        )
    ).build();

    return await cli.add(entry, ecAddress);
}

/**
 * @memberof server
 * @param {string} rootChainId - Identity Root Chain Id.
 * @param {string} serverManagementSubchainId - Server Management Subchain Id.
 * @param {number} height - Block height of the coinbase descriptor to cancel.
 * @param {number} index - Index of the coinbase descriptor to cancel.
 * @param {string} sk1 - Server identity Secret Key 1.
 * @returns {{{chainId: Buffer, extIds: Buffer[], content: Buffer}}}
 */
function generateCoinbaseCancelEntry(rootChainId, serverManagementSubchainId, height, index, sk1) {
    if (!isValidServerIdentityChainId(rootChainId)) {
        throw new Error(`Invalid root chain id ${rootChainId}`);
    }
    if (!isValidServerIdentityChainId(serverManagementSubchainId)) {
        throw new Error(`Invalid server management subchain id ${serverManagementSubchainId}`);
    }
    if (rootChainId === serverManagementSubchainId) {
        throw new Error(
            `The root chain id cannot be the same as the server management subchain id (${rootChainId})`
        );
    }
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (typeof height !== 'number' || index < 0) {
        throw new Error('Descriptor height should be a positive number');
    }
    if (typeof index !== 'number' || index < 0) {
        throw new Error('Descriptor index should be a positive number');
    }

    const version = Buffer.from('00', 'hex');
    const marker = Buffer.from('Coinbase Cancel', 'utf8');
    const chainId = Buffer.from(rootChainId, 'hex');
    const descriptorHeight = Buffer.allocUnsafe(4);
    descriptorHeight.writeUInt32BE(height);
    const descriptorIndex = Buffer.allocUnsafe(4);
    descriptorIndex.writeUInt32BE(index);

    const dataToSign = Buffer.concat([version, marker, chainId, descriptorHeight, descriptorIndex]);
    const { identityKeyPreImage, signature } = sign(extractSecretFromIdentityKey(sk1), dataToSign);

    return {
        chainId: Buffer.from(serverManagementSubchainId, 'hex'),
        extIds: [
            version,
            marker,
            chainId,
            descriptorHeight,
            descriptorIndex,
            identityKeyPreImage,
            signature
        ],
        content: Buffer.from('')
    };
}

module.exports = {
    add,
    generateCoinbaseCancelEntry
};
