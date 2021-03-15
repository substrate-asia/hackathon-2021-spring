'use strict';

const system = require('./system');
const config = require('./config');
const log = require('../common-js/log');
const env = require('./env');
const tunnel = require('./tunnel');
const chain = require('./chain');
const dp = require('./dp');

async function monitorTunnelTraffic() {
  while (true) {
    const tunnels = tunnel.getTunnels(0, 0);
    log.info(`monitorTunnelTraffic: get ${Object.keys(tunnels).length} tunnels`);
    for (let tunId in tunnels) {
      let traffic = await dp.getTunTraffic(tunId);
      let claimedTraffic = env.getServerClaimedTraffic(tunId);
      log.info(`traffic for tunId: ${tunId}: server traffic is: ${traffic}, claimed traffic is: ${claimedTraffic}`);
      if (traffic - claimedTraffic > config.SERVER_TRAFFIC_THREASHOLD) {
        log.info('traffic: monitorTunnelTraffic: client not pay on time, closing tunnel...');
        let senderAddress = tunnels[tunId]['pubKey'];
        await chain.closeMicropayment(senderAddress, receiverKeypair);
        env.removeServerClaimedTraffic(tunId);
        await tunnel._teardownTunnel(0, 0, tunId);
      }
    }
    await system.delayPromise(config.MICROPAYMENT_REFRESH_INTERVAL_MS);
  }
}

async function publishIPThread() {
  let pubIP = env.internalTestMode()? env.getDockerIP(1):env.getPubIP();
  let dpIP = env.getDPIP();
  let trafficMode = env.getTrafficMode();
  /* Duration 1 day. */
  let duration = config.REGISTER_DURATION;

  log.info('start publishIPThread...');

  if (env.getDockerEnv() && !env.deeperChainMode()) {
    log.info(`Do not publish docker IP: ${trafficMode}, ${pubIP}, ${dpIP}`);
    return;
  }

  if (trafficMode === env.TRAFFIC_MODES.TWOARM && pubIP === dpIP) {
    log.info(`OK to Publish TWOARM IP: ${trafficMode}, ${pubIP}, ${dpIP}`);
  } else if (trafficMode === env.TRAFFIC_MODES.ONEARM) {
    log.info(`OK to Publish ONEARM IP: ${trafficMode}, ${pubIP}, ${dpIP}`);
  } else {
    log.info(`Do not Publish IP: ${trafficMode}, ${pubIP}, ${dpIP}`);
    return;
  }

  while (true) {
    let myKeypair = env.getKeyPair();
    if (myKeypair) {
      let ret = await chain.update(duration, myKeypair);
      if (ret) {
        log.info(`successfully update duration ${duration}`);
      } else {
        log.error(`failed to update duration ${duration}`);
      }
    }
    await system.delayPromise(config.IP_PUBLISH_TIME_INTERVAL_MS);
  }
}

async function pocDelegationThread(){
  log.info('start pocDelegationThead...');
  while(true){
    let myKeypair = env.getKeyPair();
    if (myKeypair) {
      let pocDelegationMode = env.getPocDelegationMode();
      if (pocDelegationMode == env.POC_DELEGATION_MODES.AUTO){
        let score = await chain.getScore(myKeypair);
        if (!isNaN(parseInt(score)) && score >= config.POC_DELEGATION_SCORE_THRESHOLD){
          await chain.autoDelegate(myKeypair);
        }
      }
    }
    await system.delayPromise(config.POC_DELEGATION_THREAD_INTERVAL);
  }
}

exports.serverThread = async function () {
  publishIPThread();
  monitorTunnelTraffic();
  pocDelegationThread();
};
