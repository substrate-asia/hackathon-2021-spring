'use strict';

const Minimist = require('minimist');

const chain = require('./chain');
const mp = require('./mp');
const env = require('./env');
const config = require('./config');
const system = require('./system');
const dp = require('./dp');
const metric = require('./metric');
const ipc = require('./ipc');
const log = require('../common-js/log');
const region = require('../common-js/region');

function parseArgs() {
  let args = Minimist(process.argv.slice(2));

  if (args.o) {
    env.setTrafficMode(env.TRAFFIC_MODES.ONEARM);
  } else {
    env.setTrafficMode(env.TRAFFIC_MODES.TWOARM);
  }

  if (args.p) {
    log.info(`use public IP: ${args.p}`);
    env.setDockerIP(args.p);
  }

  if (args.docker) {
    env.setDockerEnv(true);
  } else {
    env.setDockerEnv(false);
  }

  if (args.country) {
    if (region.isValidCountry(args.country)) {
      log.info(`use country from user: ${args.country}`);
      env.setMyCountry(args.country);
    } else {
      log.error(`country from user is invalid: ${args.country}`);
    }
  }

  /* print args */
  log.info(`traffic mode = ${env.getTrafficMode()}`);
  log.info(`docker env = ${env.getDockerEnv()}`);
  log.info(`internal test mode = ${env.internalTestMode()}`);
  log.info(`deeper chain mode = ${env.deeperChainMode()}`);

  return true;
}

function initLogger() {
  let logFile, mode;

  logFile = config.LOG_FILE_DIR + 'cp.log';
  if (env.getDockerEnv()) {
    mode = 'DIE';
  } else {
    /* ignore debug info in production */
    mode = 'IE';
  }
  /* init log writer */
  log.init(logFile, mode);

  logFile = config.METRIC_FILE_DIR + 'cp';
  /* init metric writer */
  metric.init(logFile);
}

exports.initSystem = function () {
  initLogger();

  log.info('================CP start!================');
  let ret = parseArgs();
  if (!ret) {
    return false;
  }

  return true;
};

exports.initCP = async function () {
  let ret;
  let myCountry;


  /* init ipc socket */
  if (!ipc.socketCreated()) {
    ret = ipc.createIpcSocket();
    if (ret === false) {
      log.error('Failed to create IPC socket');
      return false;
    }
    log.info('IPC socket is created');
  }


  /* get sys info from DP */
  if (!env.getDPIP()) {
    let dpSysInfo = await dp.askSysInfo();
    if (dpSysInfo === null || !dpSysInfo.ip || dpSysInfo.ip === '0.0.0.0') {
      log.error('Failed to get sys info from DP');
      return false;
    } else {
      log.info('Get IP from DP:' + dpSysInfo.ip + ', MAC ' + dpSysInfo.mac);
      env.setDPIP(dpSysInfo.ip);
      env.setNbrMac(dpSysInfo.mac);
      env.setMySN(dpSysInfo.sn);
      env.setUUID();
    }
  }

  /* get public ip */
  if (!env.getPubIP()) {
    let ip = await system.getPublicIP();
    if (ip === null) {
      log.error('Failed to get public ip');
      return false;
    } else {
      log.info('Get public ip:' + ip);
      ret = await dp.setPubIP(ip); //set DP first
      if (!ret) {
        log.error('Failed to set public ip to DP');
        return false;
      }
      env.setPubIP(ip); //make sure DP IP is set first
    }
  }

  /* get own country */
  if (!env.getMyCountry()) {
    if (env.internalTestMode()) {
      myCountry = await system.lookupCountry(env.getDPIP());
    } else {
      myCountry = await system.lookupCountry(env.getPubIP());
    }

    if (myCountry === null) {
      log.error('Failed to get my country info');
      return false;
    }

    log.info('Get my country:' + myCountry);
    env.setMyCountry(myCountry);
  }

  /* init device key pair */
  if (!env.getKeyPair()) {
    const privateKey = await obtainPrivateKey();

    if (privateKey) {
      await exports.initWallet(privateKey);
    }
  }

  /* init cp success */
  return true;
};

function obtainPrivateKey() {
  return mp.getPrivateKey();
}

exports.initWallet = async privateKey => {
  env.setKeyPair(privateKey);

  const deviceKeyPair = env.getKeyPair();
  if (deviceKeyPair) {
    await initBalance(deviceKeyPair);
    await initCredit(deviceKeyPair);
    const ip = env.internalTestMode() ? env.getDockerIP(1) : env.getPubIP();
    await chain.register(ip, env.getMyCountry(), config.REGISTER_DURATION, deviceKeyPair);
  }
};

async function initBalance(keyPair) {
  let bal = await chain.getBalance(keyPair.address);
  log.info(`balance of ${keyPair.address} is ${bal}`);

  if (!isNaN(parseFloat(bal)) && bal <= 0) {
    log.info('balance is too low, airdrop...');
    // TODO: notify mp instead of airdrop
    await chain.airdrop(keyPair.address);
  }
}

async function initCredit(keyPair) {
  const credit = await chain.getScore(keyPair);
  log.info(`Credit of ${keyPair.address} is ${credit}`);

  if (!isNaN(parseInt(credit)) && credit <= 0) {
    log.info(`Credit of ${keyPair.address} is ${credit}, initialising...`);
    await chain.initCredit(keyPair);
  }
}
