const assert = require('chai').assert;
const { Entry } = require('factom');
const coinbaseAddress = require('../src/coinbase-address');

describe('Coinbase address', function () {

    it('should generate coinbase address update entry', function () {

        const entry = coinbaseAddress.generateUpdateEntry(
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            'FA1y5ZGuHSLmf2TqNf6hVMkPiNGyQpQDTFJvDLRkKQaoPo4bmbgu',
            'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk');

        assert.equal(entry.extIds[0].toString('hex'), '00');
        assert.equal(entry.extIds[1].toString('hex'), '436f696e626173652041646472657373');
        assert.equal(entry.extIds[2].toString('hex'), '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762');
        assert.equal(entry.extIds[3].toString('hex'), '0000000000000000000000000000000000000000000000000000000000000000');
        assert.equal(entry.extIds[5].toString('hex'), '0125b0e7fd5e68b4dec40ca0cd2db66be84c02fe6404b696c396e3909079820f61');
    });

    it('should extract lastest coinbase address', function () {

        const e1 = Entry.builder()
            .chainId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('00')
            .extId('436f696e626173652041646472657373')
            .extId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('d954883481f3aa501f3f5d4f9e796bafe8aa01bfe89780771e733d6396f8fb9b')
            .extId('000000005aeb63ff')
            .extId('014e5e8de90c21c09df91e8b05129404d55f0f555a2fe31800d53d6b42cf643f8c')
            .extId('74fe4060bad3427598546838dcc41e4939f4fa9c85f633aab9c8d8a68d56a1086be7d4b38cfd99ec430610f56b62b630aba307ad5f584b532ddc07dd2db92a09')
            .entryBlockContext({ entryTimestamp: 1514486120, directoryBlockHeight: 34459 })
            .build();

        const e2 = Entry.builder()
            .chainId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('00')
            .extId('436f696e626173652041646472657373')
            .extId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('0c0aed44446538b251f418b6cdf61408f9f08f56a1d80be32bd7c8085d9bd499')
            .extId('000000005aed100c')
            .extId('014e5e8de90c21c09df91e8b05129404d55f0f555a2fe31800d53d6b42cf643f8c')
            .extId('ec610761cb956106307d0bd1789a1a3ead4e2ad02824b2be276b9977b833bf09f644ad09b70698446183b706e03e8773bc2d0a4b04e778c3244c4503f6ec8703')
            .entryBlockContext({ entryTimestamp: 1534486120, directoryBlockHeight: 42189 })
            .build();

        const otherEntry = Entry.builder()
            .chainId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .build();


        const result = coinbaseAddress.extract(
            '8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f',
            [e1, e2, otherEntry],
            Buffer.from('ebbd391865bb6b2b62a03d039ac1d113584d2fb8c56932dde75f213a876d8dcb', 'hex'));

        assert.equal(result.registrationEntryHash, 'e3d14a96e24efeb5256054216940ee457042ac0dc958c1cc1b3c6d4f93fbd525');
        assert.equal(result.address, 'FA24PAtyZWWVAPm95ZCVpwyY6RYHeCMTiZt2v4VQAY8aBXMUZyeF');
        assert.equal(result.registrationTimestamp, 1534486120);
        assert.equal(result.registrationDirectoryBlockHeight, 42189);
    });

    it('should extract lastest coinbase address', function () {

        const e1 = Entry.builder()
            .chainId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('00')
            .extId('436f696e626173652041646472657373')
            .extId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('d954883481f3aa501f3f5d4f9e796bafe8aa01bfe89780771e733d6396f8fb9b')
            .extId('000000005aeb63ff')
            .extId('014e5e8de90c21c09df91e8b05129404d55f0f555a2fe31800d53d6b42cf643f8c')
            .extId('74fe4060bad3427598546838dcc41e4939f4fa9c85f633aab9c8d8a68d56a1086be7d4b38cfd99ec430610f56b62b630aba307ad5f584b532ddc07dd2db92a09')
            .entryBlockContext({ entryTimestamp: 1514486120, directoryBlockHeight: 34459 })
            .build();

        const e2 = Entry.builder()
            .chainId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('00')
            .extId('436f696e626173652041646472657373')
            .extId('8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f')
            .extId('0c0aed44446538b251f418b6cdf61408f9f08f56a1d80be32bd7c8085d9bd499')
            .extId('000000005aed100c')
            .extId('014e5e8de90c21c09df91e8b05129404d55f0f555a2fe31800d53d6b42cf643f8c')
            .extId('ec610761cb956106307d0bd1789a1a3ead4e2ad02824b2be276b9977b833bf09f644ad09b70698446183b706e03e8773bc2d0a4b04e778c3244c4503f6ec8703')
            .entryBlockContext({ entryTimestamp: 1534486120, directoryBlockHeight: 42189 })
            .build();

        const result = coinbaseAddress.extractHistory(
            '8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f',
            [e1, e2],
            Buffer.from('ebbd391865bb6b2b62a03d039ac1d113584d2fb8c56932dde75f213a876d8dcb', 'hex'));

        assert.lengthOf(result, 2);

        assert.equal(result[0].registrationEntryHash, 'e3d14a96e24efeb5256054216940ee457042ac0dc958c1cc1b3c6d4f93fbd525');
        assert.equal(result[0].address, 'FA24PAtyZWWVAPm95ZCVpwyY6RYHeCMTiZt2v4VQAY8aBXMUZyeF');
        assert.equal(result[0].registrationTimestamp, 1534486120);
        assert.equal(result[0].registrationDirectoryBlockHeight, 42189);

        assert.equal(result[1].registrationEntryHash, '0ade4b31030925f95c3c9ef1d3a8ba717b303e846393974d9c7ee9a645119cc6');
        assert.equal(result[1].address, 'FA3cnxxcRxm6RQs2hpExdEPo9utyeBZecWKeKa1pFDCrRoQh9aVw');
        assert.equal(result[1].registrationTimestamp, 1514486120);
        assert.equal(result[1].registrationDirectoryBlockHeight, 34459);
    });

});