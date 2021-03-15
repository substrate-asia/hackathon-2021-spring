'use strict';

const to = require('await-to-js').default;
const ipLib = require('public-ip');
const superagent = require('superagent');
const fs = require('fs');
const profiler = require('v8-profiler-node8');
const exec = require('node-exec-promise').exec;

const env = require('./env');
const log = require('../common-js/log');
const util = require('../common-js/util');
const region = require('../common-js/region');
const ipLookup = require('../common-js/ip-lookup');

let profileData = null;
let startProfile = false;

let delayPromise = (exports.delayPromise = function (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
});

exports.ntpSync = async function () {
  let cnt = 0;
  while (cnt < 10) {
    try {
      await exec('/usr/sbin/ntpdate -u pool.ntp.org');
      await exec('/sbin/hwclock --systohc --local');
      log.info('ntp sync success');
      return;
    } catch (err) {
      log.error(`ntp sync err: ${err}`);
      ++cnt;
    }
  }

  log.error(`ntp sync failed ${cnt} times, give up`);
};

async function getIPPromise() {
  return util.promiseWithErrorOnTimeout(ipLib.v4(), 5 * 1000);
}

async function getIPPromiseWeb() {
  return util.promiseWithErrorOnTimeout(superagent.get('http://ip-api.com/json/'), 5 * 1000);
}

exports.getPublicIP = async function () {
  let err, res, publicIP;

  [err, publicIP] = await to(getIPPromise());
  if (err === null) {
    if (util.isPublicIP(publicIP)) {
      return publicIP;
    }
    log.error('Err - The ip is a LAN IP:' + publicIP);
  }

  log.error('Failed to get IP from public ip library');

  [err, res] = await to(getIPPromiseWeb());
  if (err === null) {
    try {
      let info = JSON.parse(res.text);
      if (info) {
        publicIP = info.query;
        if (util.isPublicIP(publicIP)) {
          return publicIP;
        }
        log.error('Err - Got a wrong ip:' + publicIP);
      }
    } catch (error) {
      log.error('Failed to parse ip JSON from web');
    }
  }

  log.error('Failed to get IP from web');

  return null;
};

exports.lookupCountry = async function (ip) {
  let country = null;

  /* for docker test only */
  if (env.internalTestMode()) {
    if (ip === '172.17.0.2' || ip === '172.17.0.3') {
      return 'US';
    } else if (ip === '172.17.0.4' || ip === '172.17.0.5') {
      return 'DE';
    } else if (ip === '172.17.0.6') {
      return 'CN';
    } else {
      return 'US';
    }
  }

  try {
    let res = await ipLookup.lookupIp(ip);
    if (!res || !res.country) {
      log.error('Found nothing while lookup the country for ip:' + ip);
    } else if (!region.isValidCountry(res.country)) {
      log.error(`${res.country} is not a valid country`);
    } else {
      country = res.country;
    }
  } catch (err) {
    log.error('Geo lookup err:' + err);
  }

  return country;
};

exports.getDstPort = function () {
  let port = Math.floor(Math.random() * 65535);

  if (port < 1024) {
    port = 80;
  }

  return port.toString();
};

process.on('SIGUSR1', () => {
  if (startProfile) {
    stopPF();
  } else {
    startPF();
  }
});

let startPF = (exports.startProfile = function () {
  log.info('Start profile...');
  profiler.startProfiling('cp-cpu-profile');
  startProfile = true;
});

let stopPF = (exports.stopProfile = function () {
  log.info('Dumping profile data...');
  profileData = profiler.stopProfiling();

  if (profileData === null) {
    log.error('no profile data');
    return;
  }
  log.info(profileData.getHeader());

  profileData.export((err, result) => {
    if (err) {
      log.error(err);
    } else {
      fs.writeFileSync('cp.cpuprofile', result);
      log.info('Dumping data done');
    }
    profileData.delete();
    profileData = null;
    startProfile = false;
  });
});
