/**
 * Usage:
 *
 * NETWORK_CONFIG=~/mynet/network_config.yaml node add_well_known_node.js
 *
 * 1. if NETWORK_CONFIG is not set, the default config file is ./develop.yaml
 */
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { getNetworkConfig, execTx } = require('./utils');

;(async() => {
  try {
    const networkConfig = await getNetworkConfig();
    const mainPeersAddress = networkConfig.peers.reduce((result, peer) => {
      if (peer.is_group_main) {
        return {
          ...result,
          [peer.group]: peer.secret.sr25519_ss58_address,
        };
      }
      return result;
    }, {});
    const rootPeer = networkConfig.peers.find((peer) => peer.is_root);
    const provider = new WsProvider(`ws://${rootPeer.ip}:${rootPeer.ws_port}`);
    const api = await ApiPromise.create({
      provider,
      types: {
        PeerId: '(Vec<u8>)',
      },
    });
    await api.isReady;
    const keyring = new Keyring({ type: 'sr25519' });
    const sudoPair = keyring.addFromUri(rootPeer.secret.phrase);
    const txs = networkConfig.peers
      .filter(({ is_group_main }) => !is_group_main)
      .map(({ peer_id_hex, group }) => api.tx.sudo.sudo(
        api.tx.nodeAuthorization.addWellKnownNode(
          `0x${peer_id_hex}`,
          mainPeersAddress[group],
        ),
      ));
    await execTx(api.registry, api.tx.utility.batch(txs), sudoPair);
    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();