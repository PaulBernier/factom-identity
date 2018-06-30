# factom-identity-lib.js

Library to read and update Factom identities. (underlying library of factom-identity-cli)

## Installation

```bash
$ npm install --save factom-identity-lib
```

## Usage

### Instantiate FactomIdentityManager

```javascript
const { FactomIdentityManager } = require('factom-identity-lib');

// Default factomd connection to localhost:8088
const manager = new FactomIdentityManager();

// You can override factomd connection parameters and retry strategy
const manager = new FactomIdentityManager({
    host: '52.202.51.228',
    port: 8088,
    retry: {
        retries: 4,
        factor: 2,
        minTimeout: 500,
        maxTimeout: 2000
    }
});
```

### Get identity information

```javascript
const manager = new FactomIdentityManager();

// Retrieve current values of the identity
manager.getIdentityInformation('888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').then(console.log);
// Retrieve history of values of the identity
manager.getIdentityInformationHistory('888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').then(console.log);
```

### Update identity

#### Using FactomIdentityManager 

```javascript
const manager = new FactomIdentityManager();

manager.updateCoinbaseAddress(
    '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
    'FA29jNtT88wGjs9YLQch8ur4VFaTDkuiDwWe1YmksPDJuh3tAczG',
    'sk12J1qQCjTdtnJ85bmb1iSizEvtzTQMBi5sz8zd5f62e7ib36pvz',
    'Es3ytEKt6R5jM9juC4ks7rt4f8A8dpRnM4WADtgFoq7j1785feGW')
    .then(console.log);

manager.updateEfficiency(
    '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
    99.99,
    'sk12J1qQCjTdtnJ85bmb1iSizEvtzTQMBi5sz8zd5f62e7ib36pvz',
    'Es3ytEKt6R5jM9juC4ks7rt4f8A8dpRnM4WADtgFoq7j1785feGW')
    .then(console.log);
```

#### Generating Entry

You can only generate the entry necessary to update the identity and submit it manually (using factom.js library).

```javascript
const { generateCoinbaseAddressUpdateEntry, generateEfficiencyUpdateEntry } = require('factom-identity');

const entry = generateCoinbaseAddressUpdateEntry(
    '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
    'FA29jNtT88wGjs9YLQch8ur4VFaTDkuiDwWe1YmksPDJuh3tAczG',
    'sk12J1qQCjTdtnJ85bmb1iSizEvtzTQMBi5sz8zd5f62e7ib36pvz',
    'Es3ytEKt6R5jM9juC4ks7rt4f8A8dpRnM4WADtgFoq7j1785feGW');

const entry = generateEfficiencyUpdateEntry(
    '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
    '88888846e558fe4e301cdd89e719d162f4b6e1c0ada0fe3db7394fc6daa6c46e',
    99.99,
    'sk12J1qQCjTdtnJ85bmb1iSizEvtzTQMBi5sz8zd5f62e7ib36pvz',
    'Es3ytEKt6R5jM9juC4ks7rt4f8A8dpRnM4WADtgFoq7j1785feGW');
```
