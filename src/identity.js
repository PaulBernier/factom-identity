const { getIdentityRootChain, getServerManagementSubchain } = require('./identity-chains');
const cbAddress = require('./coinbase-address');
const eff = require('./efficiency');


async function getInformation(cli, rootChainId) {
    const rootChain = await getIdentityRootChain(cli, rootChainId);

    const managementSubchain = await getServerManagementSubchain(cli, rootChain.serverManagementSubchainId, rootChainId);

    const coinbaseAddress = cbAddress.extract(rootChainId, rootChain.entries, rootChain.identityKeys[0]);
    const efficiency = eff.extract(rootChainId, managementSubchain.entries, rootChain.identityKeys[0]);

    return {
        rootChainId,
        serverManagementSubchainId: rootChain.serverManagementSubchainId.toString('hex'),
        coinbaseAddress,
        efficiency,
        identityKeys: rootChain.identityKeys.map(ik => ik.toString('hex'))
    };
}

async function getInformationHistory(cli, rootChainId) {
    const rootChain = await getIdentityRootChain(cli, rootChainId);

    const managementSubchain = await getServerManagementSubchain(cli, rootChain.serverManagementSubchainId, rootChainId);

    const coinbaseAddressHistory = cbAddress.extractHistory(rootChainId, rootChain.entries, rootChain.identityKeys[0]);
    const efficiencyHistory = eff.extractHistory(rootChainId, managementSubchain.entries, rootChain.identityKeys[0]);

    return {
        rootChainId,
        serverManagementSubchainId: rootChain.serverManagementSubchainId.toString('hex'),
        coinbaseAddressHistory,
        efficiencyHistory,
        identityKeys: rootChain.identityKeys.map(ik => ik.toString('hex'))
    };
}


module.exports = {
    getInformation,
    getInformationHistory
};