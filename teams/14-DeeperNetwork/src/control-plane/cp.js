'use strict';

const fsExt = require('fs-ext');
const env = require('./env');
const system = require('./system');
const config = require('./config');
const client = require('./client');
const server = require('./server');
const log = require('../common-js/log');
const init = require('./init');
const metric = require('./metric');

process.on('uncaughtException', err => {
  log.error('uncaughtException:');
  log.error(err.stack);
  process.exit(1);
});

function writePid() {
  try {
    let fd = fsExt.openSync(
      config.PID_FILE_DIR + 'cp.pid',
      'a'
    );

    fsExt.flockSync(fd, 'exnb');

    let pid = process.pid;
    if (pid) {
      fsExt.ftruncateSync(fd);
      fsExt.writeSync(fd, pid);
      log.info(`write cp pid ${pid} to file`);
    } else {
      log.error('Failed to get cp pid');
      return false;
    }

    return true;
  } catch (err) {
    log.error('Failed to write cp pid to file:' + err);
    return false;
  }
}

async function initCP() {
  /* init must succeed before we can move to next step */
  while (true) {
    log.info('start to init CP...');
    let ret = await init.initCP();
    if (!ret) {
      log.error('init cp failed, restarting...');
    } else {
      log.info('init cp succeeded');
      break;
    }

    log.info('wait 3000ms...');
    await system.delayPromise(3000);
  }
}

async function statusSnapshotThread() {
  log.info('start statusSnapshotThread...');

  while (true) {
    await metric.statusSnapshot();
    await system.delayPromise(5000);
  }
}

async function syncTimeThread() {
  log.info('Starting time syncing thread...');

  while (true) {
    await system.ntpSync();
    await system.delayPromise(1000 * 60 * 60); // sync every hour
  }
}

async function startCP() {
  /* will stuck here if initCP() failed */
  await initCP();

  statusSnapshotThread();
  syncTimeThread();

  if (env.getTrafficMode() !== env.TRAFFIC_MODES.ONEARM || env.getVmEnv()) {
    client.clientThread();
  } else {
    log.info(`Do not act as a client ${env.getTrafficMode()} ${env.getVmEnv()}`);
  }

  if (!env.getVmEnv() && !env.getMySN().includes('CLDBG')) {
    server.serverThread();
  } else {
    log.info(`Do not act as a server ${env.getTrafficMode()} ${env.getVmEnv()}`);
  }
}

function main() {
  let ret = init.initSystem();
  if (!ret) {
    log.error('init system failed');
    return;
  }

  try {
    ret = writePid();
    if (ret === false) {
      log.error('Another CP is already running');
      return;
    }
  } catch (err) {
    log.error('Write pid function failed:' + err);
    return;
  }

  startCP();
}

main();
