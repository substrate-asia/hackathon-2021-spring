/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

var HDWalletProvider = require("truffle-hdwallet-provider");
var privKey = process.env.privKey;
var infuraId = process.env.infuraId;
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
require("ts-node/register"); // eslint-disable-line
require("dotenv-flow").config(); // eslint-disable-line

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */
  deploySwitch: {
    DEPLOY_V1:          false,
    DEPLOY_V2:          false,
    ADAPTER:            false,
    MOCK_TOKEN:         false,
    MOCK_V2_POOL:       false,
    vDODOToken:         false,
    DODORecharge:       false,
    MINE:               false,
    FEERATEIMPL:        false,
    WETH:               false,
    DODO:               false,
    UpCP:               false,
    DVM:                true,
    CP:                 false,
    CPFactory:          false
  },

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
  
    mbtestnet: {
      provider: () => {
        return new HDWalletProvider(privKey, 'https://rpc.testnet.moonbeam.network');
      },
      network_id: 1287,
    },
    
    mbdev: {
      provider: () => {
        return new HDWalletProvider(privKey, 'http://localhost:9933/')
      },
      network_id: 1281,
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: false,
  },
  plugins: ["solidity-coverage"],
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.9", // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
