const { FactomCli } = require('factom');
const coinbaseAdress = require('./coinbase-address');
const efficiency = require('./efficiency');
const identity = require('./identity');

class FactomIdentityManager {
    constructor(arg) {
        if (arg instanceof FactomCli) {
            this.cli = arg;
        } else {
            this.cli = new FactomCli(arg);
        }
    }

    async getIdentityInformation(rootChainId) {
        return identity.getInformation(this.cli, rootChainId);
    }

    async getIdentityInformationHistory(rootChainId) {
        return identity.getInformationHistory(this.cli, rootChainId);
    }

    async updateCoinbaseAddress(rootChainId, fctAddress, sk1, ecPrivateAddress) {
        return coinbaseAdress.update(this.cli, rootChainId, fctAddress, sk1, ecPrivateAddress);
    }

    async updateEfficiency(rootChainId, eff, sk1, ecPrivateAddress) {
        return efficiency.update(this.cli, rootChainId, eff, sk1, ecPrivateAddress);
    }
}

module.exports = {
    FactomIdentityManager
};
