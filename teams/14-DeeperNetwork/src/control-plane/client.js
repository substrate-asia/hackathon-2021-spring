'use strict';

const system = require('./system');
const env = require('./env');
const mp = require('./mp');
const dp = require('./dp');
const tunnel = require('./tunnel');
const nat = require('./nat');
const log = require('../common-js/log');
const chain = require('./chain');
const config = require('./config');

const tunnelSetupThreshold = 3;
const checkTunNumTimeMap = {}; // when to check tunNum for each region
const setupCountMap = {}; // consecutive number of setup for each region

async function monitorCliDataTunnels() {
  let rgns = tunnel.getRegions();

  /* clear cli data tunnels */
  await tunnel.clearCliDataTunnels();

  let ctrl = 0, cli = 1;
  /* refresh tunnel status */
  await tunnel.refreshTunnels(ctrl, cli);

  /* check if we still have tunnels to each region */
  const promiseList = [];
  for (let rgn of rgns) {
    const setupPromise = checkAndSetUpTunnels(rgn, ctrl, cli);
    promiseList.push(setupPromise);
  }
  await Promise.all(promiseList);
}

async function checkAndSetUpTunnels(rgn, ctrl, cli) {
  const nextCheckTime = checkTunNumTimeMap[rgn];
  if (!nextCheckTime || Date.now() >= nextCheckTime) {
    // no check time recorded OR passed check time, check immediately
    let tunNum = tunnel.getTunnelNumByRegion(rgn, ctrl, cli);
    log.debug(`find ${tunNum} cli data tunnels for ${rgn}`);

    if (tunNum < tunnelSetupThreshold) {
      log.info(`Current number of tunnels for ${rgn} is ${tunNum} < ${tunnelSetupThreshold}, setting up...`);
      await tunnel.setupCliDataTunnels(rgn);

      // increment count
      setupCountMap[rgn] = (setupCountMap[rgn] || 0) + 1;
      // record next check time, wait for (2^count * 10) seconds
      checkTunNumTimeMap[rgn] = Date.now() + Math.pow(2, setupCountMap[rgn]) * 10 * 1000;
    } else {
      // there are enough tunnels for this region, reset count
      setupCountMap[rgn] = 0;
    }
  }
  // else: haven't reached check time, do nothing
}

async function monitorTunnelThread() {
  log.info('start monitor tunnel thread...');
  while (true) {
    await monitorCliDataTunnels();
    await system.delayPromise(5000);
  }
}

async function monitorUnknownTunnelsThread() {
  log.info('Starting monitor unknown tunnels thread...');

  while (true) {
    await tunnel.tearDownUnknownTunnels();
    await system.delayPromise(10000);
  }
}

async function micropaymentThread() {
  log.info('Starting client micropayment thread...');
  while (true) {
    let myKeypair = env.getKeyPair();
    if (myKeypair) {
      const tunnels = tunnel.getTunnels(0, 1);
      log.info(`micropayment: get ${Object.keys(tunnels).length} tunnels`);
      for (let tunId in tunnels) {
        let receiverAddr = tunnels[tunId]['pubKey'];
        if (!receiverAddr) {
          log.info('micropayment: receiverAddr not exists');
          continue;
        }
        let traffic = await dp.getTunTraffic(tunId);
        let claimedTraffic = env.getClientClaimedTraffic(tunId);
        log.info(`traffic for tunId ${tunId}: client traffic is: ${traffic}, claimedTraffic is: ${claimedTraffic}`);
        if (traffic - claimedTraffic >= config.CLIENT_TRAFFIC_THREASHOLD) {
          let amt = (traffic - claimedTraffic) * config.DATA_TO_DPR_RATIO;
          log.info(`micropayment: sending ${amt} DPR to ${receiverAddr}...`);
          let micropaymentMsg = await chain.constructMicropaymentMsg(myKeypair, receiverAddr, tunId, amt);
          let jsonStr = JSON.stringify(micropaymentMsg);
          log.info(
           `micropayment: sending json for tunnel, tunIdx: ${tunId}, jsonStr: ${jsonStr}`
          );
          await tunnel.sendJson(0, 1, tunId, jsonStr);
          env.setClientClaimedTraffic(tunId, traffic);
        }
      }
    }
    await system.delayPromise(config.MICROPAYMENT_REFRESH_INTERVAL_MS);
  }
}

exports.clientThread = async function () {
  mp.askConfig();
  nat.natTraversalThread();
  monitorTunnelThread();
  monitorUnknownTunnelsThread();
  micropaymentThread();
};

