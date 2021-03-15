'use strict';

const fs = require('fs');
const config = require('./config');
const { Keyring } = require('@polkadot/api');

const TRAFFIC_MODES = {
  ONEARM: 'onearm',
  TWOARM: 'twoarm',
};
const POC_DELEGATION_MODES = {
  AUTO: 'auto',
  MANUAL: 'manual',
};

let dataSrvIPDocker = '172.17.0.4';
let ctrlSrvIPDocker = '172.17.0.4';

let dockerEnv = false;
let vmEnv = null;
let internalTest = null;
let trafficMode;
let deviceType;
let dpIP;
let pubIP;
let myCountry;
let nbrMac;
let mySN;
let uuid;
let deeperChainMode = null;
let keyPair = null;
let sessionId = 0;
let pocDelegationMode = null;

let serverClaimedTraffic = {};
let clientClaimedTraffic = {};

exports.setDockerIP = function (val) {
  dataSrvIPDocker = val;
  ctrlSrvIPDocker = val;
};

exports.getDockerIP = function(isData) {
  if (isData) {
    return dataSrvIPDocker;
  }
  return ctrlSrvIPDocker;
};

exports.setDockerEnv = function (val) {
  dockerEnv = val;
};

exports.getDockerEnv = function () {
  return dockerEnv;
};

exports.getVmEnv = function () {
  if (vmEnv !== null) {
    return vmEnv;
  }

  if (fs.existsSync('/tmp/vm')) {
    vmEnv = true;
  } else {
    vmEnv = false;
  }

  return vmEnv;
};

exports.internalTestMode = function () {
  if (internalTest !== null) {
    return internalTest;
  }

  if (fs.existsSync('/tmp/internal')) {
    internalTest = true;
  } else {
    internalTest = false;
  }

  return internalTest;
};

exports.deeperChainMode = function () {
  if (deeperChainMode !== null) {
    return deeperChainMode;
  }

  if (fs.existsSync('/tmp/deeperchain')) {
    deeperChainMode = true;
  } else {
    deeperChainMode = false;
  }

  return deeperChainMode;
};

exports.getPocDelegationMode = function () {
  return pocDelegationMode;
}

exports.setPocDelegationMode = function (val) {
  if(val == POC_DELEGATION_MODES.MANUAL){
    pocDelegationMode = POC_DELEGATION_MODES.MANUAL;
  }else{
    pocDelegationMode = POC_DELEGATION_MODES.AUTO;
  }
}

exports.setTrafficMode = function (val) {
  trafficMode = val;
  if (trafficMode === TRAFFIC_MODES.TWOARM) {
    deviceType = 0;
  } else if (trafficMode === TRAFFIC_MODES.ONEARM) {
    deviceType = 1;
  } else {
    deviceType = 2;
  }
};

exports.getTrafficMode = function () {
  return trafficMode;
};

exports.getDeviceType = function () {
  return deviceType;
};

exports.setDPIP = function (val) {
  dpIP = val;
};

exports.getDPIP = function () {
  return dpIP;
};

exports.setPubIP = function (val) {
  pubIP = val;
};

exports.getPubIP = function () {
  return pubIP;
};

exports.setMyCountry = function (val) {
  myCountry = val;
};

exports.getMyCountry = function () {
  return myCountry;
};

exports.setNbrMac = function (val) {
  nbrMac = val;
};

exports.getNbrMac = function () {
  return nbrMac;
};

exports.setMySN = function (val) {
  mySN = val;
};

exports.setUUID = function () {
  if (fs.existsSync(config.UUID_FILE_PATH)) {
    let uuidFile = fs.readFileSync(config.UUID_FILE_PATH);
    uuid = uuidFile && uuidFile.toString();
  }
};

exports.getMySN = function () {
  return mySN;
};

exports.getUUID = function () {
  return uuid;
};

exports.setKeyPair = function (privateKey) {
  if (privateKey) {
    const keyring = new Keyring({ type: "sr25519" });
    keyPair = keyring.addFromUri(privateKey);
  } else {
    keyPair = null;
  }
};

exports.getKeyPair = function () {
  return keyPair;
};

// micropayment channel sessionID
exports.getSessionId = function () {
  return sessionId;
}

exports.setSessionId = function(sid) {
  sessionId = sid
}

exports.increaseServerClaimedTraffic = function(tunId, payment) {
  let data = payment/config.DATA_TO_DPR_RATIO;
  if (!(tunId in serverClaimedTraffic)) {
    serverClaimedTraffic[tunId] = 0;
  }
  serverClaimedTraffic[tunId] += data;
}

exports.getServerClaimedTraffic = function(tunId) {
  if (tunId in serverClaimedTraffic) {
    return serverClaimedTraffic[tunId];
  }
  return 0;
}

exports.removeServerClaimedTraffic = function(tunId) {
  if (tunId in serverClaimedTraffic) {
    delete serverClaimedTraffic[tunId];
  }
}

exports.setClientClaimedTraffic = function(tunId, data) {
  clientClaimedTraffic[tunId] = data;
}

exports.getClientClaimedTraffic = function(tunId, data) {
  if (tunId in clientClaimedTraffic) {
    return clientClaimedTraffic[tunId];
  }
  return 0;
}

exports.removeClientClaimedTraffic = function(tunId) {
  if (tunId in clientClaimedTraffic) {
    delete clientClaimedTraffic[tunId];
  }
}


module.exports.TRAFFIC_MODES = TRAFFIC_MODES;
module.exports.POC_DELEGATION_MODES = POC_DELEGATION_MODES;
