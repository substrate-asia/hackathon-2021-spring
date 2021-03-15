import { RedspotUserConfig } from 'redspot/types';
import '@redspot/patract';
import '@redspot/chai';
import '@redspot/gas-reporter';

export default {
  defaultNetwork: 'development',
  contract: {
    ink: {
      toolchain: 'nightly',
      sources: ['contracts/**/*']
    }
  },
  networks: {
    development: {
      endpoint: 'ws://127.0.0.1:9944',
      types: {
        "LookupSource": "MultiAddress",
        "Address": "MultiAddress",
        "FullIdentification": "AccountId",
        "AuthorityState": {
          "_enum": [
            "Working",
            "Waiting"
          ]
        },
        "EraIndex": "u32",
        "ActiveEraInfo": {
          "index": "EraIndex",
          "start": "Option<u64>"
        },
        "UnappliedSlash": {
          "validator": "AccountId",
          "reporters": "Vec<AccountId>"
        }
      },
      gasLimit: '400000000000',
      explorerUrl: 'https://polkadot.js.org/apps/#/explorer/query/'
    },
    substrate: {
      endpoint: 'ws://127.0.0.1:9944',
      gasLimit: '400000000000',
      accounts: ['//Alice'],
      types: {}
    }
  },
  mocha: {
    timeout: 180000
  }
} as RedspotUserConfig;
