/**
 * Usage:
 *
 * NETWORK_CONFIG=~/mynet/network_config.yaml node deploy_contract.js ~/mynet/hello.contract 1000
 *
 * 1. if NETWORK_CONFIG is not set, the default config file is ./develop.yaml
 * 2. the second arg is endowment used to exec deploy transaction
 */
const fs = require('fs');
const BN = require('bn.js');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { Abi } = require('@polkadot/api-contract');
const { compactAddLength, BN_TEN } = require('@polkadot/util');
const { getNetworkConfig, execTx } = require('./utils');

;(async() => {
  try {
    const networkConfig = await getNetworkConfig();
    const rootPeer = networkConfig.peers.find((peer) => peer.is_root);
    const provider = new WsProvider(`ws://${rootPeer.ip}:${rootPeer.ws_port}`);
    const api = await ApiPromise.create({
      provider,
      types: {
        PeerId: '(Vec<u8>)',
      },
    });
    await api.isReady;
    const args = process.argv.slice(2);
    const gasLimit = (api.consts.system.blockWeights
      ? api.consts.system.blockWeights.maxBlock
      : api.consts.system.maximumBlockWeight
    ).div(BN_TEN);
    const endowment = new BN(args[1]).mul(new BN('1000000000000'));
    const keyring = new Keyring({ type: 'sr25519' });
    const sudoPair = keyring.addFromUri(rootPeer.secret.phrase);
    const abi = new Abi(
      fs.readFileSync(args[0], 'utf-8'),
      api.registry.getChainProperties()
    );
    const constructorIndex = abi.constructors.findIndex(
      (constructor) => constructor.identifier === 'default',
    );
    if (constructorIndex === -1) {
      throw new Error("Can't find default constructor for your contract.")
    }
    const { status, message, data } = await execTx(
      api.registry,
      api.tx.contracts.instantiateWithCode(
        endowment,
        gasLimit,
        compactAddLength(abi.project.source.wasm),
        abi.findConstructor(constructorIndex).toU8a([]),
        null
      ),
      sudoPair,
    );
    if (!status) {
      throw new Error(message ? message : 'Contract instantiated failed');
    }
    const address = data.findRecord('contracts', 'Instantiated')?.event?.data[1];
    if (!address) {
      throw new Error('Contract instantiated failed');
    }
    console.log(`\nContract ${abi.project.contract.name} address is: ${address.toString()}\n`);
    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();