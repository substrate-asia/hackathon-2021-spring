'use strict';

const tun = require('./tunnel');
const nat = require('./nat');
const fs = require('fs');
const execSync = require('child_process').execSync;
const config = require('./config');

let initialized = false;

let metricFile = null;
let statusFile = null;
let logFileOld = null;
let logSize = 0;

function getDate() {
  let date = new Date();

  let hour = date.getHours();
  hour = (hour < 10 ? '0' : '') + hour;

  let min = date.getMinutes();
  min = (min < 10 ? '0' : '') + min;

  let sec = date.getSeconds();
  sec = (sec < 10 ? '0' : '') + sec;

  let year = date.getFullYear();

  let month = date.getMonth() + 1;
  month = (month < 10 ? '0' : '') + month;

  let day = date.getDate();
  day = (day < 10 ? '0' : '') + day;

  return year + month + day + ',' + hour + ':' + min + ':' + sec;
}

exports.init = function (filename) {
  metricFile = filename + '_metric.log';
  logFileOld = metricFile + '.old';

  statusFile = filename + '_status.log';

  initialized = true;
};

function checkLogSize() {
  if (logSize > config.METRIC_FILE_SZ) {
    try {
      fs.renameSync(metricFile, logFileOld);
    } catch (err) {
      return;
    }

    /* reset log size */
    logSize = 0;
  }
}

exports.size = function () {
  return logSize;
};

function doWrite(file, str, append) {
  if (append) {
    execSync(`echo '${str}' >> ${file}`);
  } else {
    execSync(`echo '${str}' > ${file}`);
  }
}

/* record metric in json format */
exports.record = function (metric) {
  if (!initialized) {
    return;
  }

  checkLogSize();

  /* always add record timestamp */
  metric['timestamp'] = getDate();

  /* convert to pretty print json string */
  let metricStr = JSON.stringify(metric, null, 2);
  doWrite(metricFile, metricStr, 1);
  logSize += metricStr.length;
};

async function tunStatusSnapshot() {
  let statusStr;

  /* clear old status first */
  statusStr = 'CP status summary:';
  doWrite(statusFile, statusStr, 0);

  /* cli data tunnel */
  statusStr = '\ncli data tunnels';
  doWrite(statusFile, statusStr, 1);
  statusStr = JSON.stringify(tun.getTunnels(0, 1), null, 2);
  doWrite(statusFile, statusStr, 1);

  /* cli ctrl tunnel */
  statusStr = '\ncli ctrl tunnels';
  doWrite(statusFile, statusStr, 1);
  statusStr = JSON.stringify(tun.getTunnels(1, 1), null, 2);
  doWrite(statusFile, statusStr, 1);

  /* srv data tunnel */
  statusStr = '\nsrv data tunnels';
  doWrite(statusFile, statusStr, 1);
  statusStr = JSON.stringify(tun.getTunnels(0, 0), null, 2);
  doWrite(statusFile, statusStr, 1);

  /* srv ctrl tunnel */
  statusStr = '\nsrv ctrl tunnels';
  doWrite(statusFile, statusStr, 1);
  statusStr = JSON.stringify(tun.getTunnels(1, 0), null, 2);
  doWrite(statusFile, statusStr, 1);

  /* country nodes */
  statusStr = '\nnat nodes';
  doWrite(statusFile, statusStr, 1);
  statusStr = JSON.stringify(Array.from(nat.countryNodeMap.entries()), null, 2);
  doWrite(statusFile, statusStr, 1);
}

exports.statusSnapshot = async function () {
  if (!initialized) {
    return;
  }

  await tunStatusSnapshot();
};
