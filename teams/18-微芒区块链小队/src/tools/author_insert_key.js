/**
 * Usage:
 *
 * NETWORK_CONFIG=~/mynet/network_config.yaml node author_insert_key.js
 *
 * 1. if NETWORK_CONFIG is not set, the default config file is ./develop.yaml
 */
const { HttpProvider } = require('@polkadot/rpc-provider');
const { getNetworkConfig } = require('./utils');

;(async () => {
  const networkConfig = await getNetworkConfig();
  const rootPeer = networkConfig.peers.find((peer) => peer.is_root);
  const provider = new HttpProvider(`http://${rootPeer.ip}:${rootPeer.rpc_port}`);
  for (const peer of networkConfig.peers) {
    if (peer.is_group_main) {
      const { secret: { phrase, sr25519_public_key, ed25519_public_key } } = peer;
      await provider.send('author_insertKey', [
        'aura',
        phrase,
        `0x${sr25519_public_key}`,
      ]);
      await provider.send('author_insertKey', [
        'gran',
        phrase,
        `0x${ed25519_public_key}`,
      ]);
    }
  }
})();
