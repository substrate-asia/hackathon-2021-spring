'use strict';

const env = require('./env');
const tunnel = require('./tunnel');
const system = require('./system');
const config = require('./config');
const dp = require('./dp');
const log = require('../common-js/log');
const region = require('../common-js/region');

let ctryNodesMap = new Map();

function natModeValid(natMode) {
  if (natMode === 'nat_type_open_internet') {
    return true;
  } else if (natMode === 'nat_type_full_cone_nat') {
    return true;
  } else if (natMode === 'nat_type_restrict_cone_nat') {
    return true;
  } else if (natMode === 'nat_type_port_restrict_cone_nat') {
    return true;
  } else if (natMode === 'nat_type_sym_udp_firewall') {
    return true;
  } else if (natMode === 'nat_type_sym_nat_local') {
    return true;
  } else if (natMode === 'nat_type_sym_nat') {
    return true;
  } else if (natMode === 'nat_type_udp_blocked') {
    return true;
  } else {
    return false;
  }
}

async function natBroadcastLoop(natType) {
  let rgns = tunnel.getRegions();

  if (rgns.size === 0) {
    return;
  }

  let ret = await dp.natMap();
  if (!ret) {
    log.error('get nat map error');
    return;
  } else {
    log.debug(`get nat map ok, ${ret.localIP}:${ret.localPort} => ${ret.pubIP}:${ret.pubPort}`);
  }

  for (let rgn of rgns) {
    await __natBroadcastLoop(natType, rgn, ret.localIP,
      ret.localPort, ret.pubIP, ret.pubPort);
  }
}

async function __natBroadcastLoop(natType, rgn, localIp, localPort, pubIp, pubPort) {
  let ret;
  let num, num1, num2;
  let asClient = 0;
  let asServer = 0;

  num = tunnel.getTunnelNumByRegion(rgn, 0, 1);
  if (num < config.NAT_CLI_TUNNEL_THRESH) {
    asClient = 1;
  }

  num1 = tunnel.getTunnelNum(0, 0, 0, 1);
  num2 = tunnel.getTunnelNum(0, 0, 1, 1);
  num = num1 + num2;

  if (num < config.NAT_SRV_TUNNEL_THRESH) {
    asServer = 1;
  }

  if (asClient === 0 && asServer === 0) {
    log.debug('enough nat tunnels, do not broadcast, return');
    return;
  }

  log.debug(`nat type:${natType}, check ctrl tunnel...`);

  /* report nat information to ctrl server */
  await dp.natBroadcast(localIp, localPort, pubIp, pubPort,
    rgn, asClient, asServer);
}

function saveNatNode(natNode) {
  let natNodesArray;

  let path = region.resolveRgnPath(natNode.srcCountry);
  if (!path) {
    return;
  }

  for (let rgn of path) {
    /* get */
    natNodesArray = ctryNodesMap.get(rgn);
    if (!natNodesArray) {
      natNodesArray = [];
      ctryNodesMap.set(natNode.srcCountry, natNodesArray);
    }

    /* save */
    natNodesArray.push(natNode);
  }
}

function natNodeMatch(cliNode, srvNode) {
  if (cliNode.type === 'nat_type_full_cone_nat') {
    return 1;
  } else if (cliNode.type === 'nat_type_restrict_cone_nat') {
    return 1;
  } else if (cliNode.type === 'nat_type_port_restrict_cone_nat') {
    if (srvNode.type === 'nat_type_full_cone_nat') {
      return 1;
    }

    if (srvNode.type === 'nat_type_restrict_cone_nat') {
      return 1;
    }

    if (env.internalTestMode()) { //only for docker test
      if (srvNode.type === 'nat_type_port_restrict_cone_nat') {
        return 1;
      }
    }

  } else if (cliNode.type === 'nat_type_sym_nat') {
    if (srvNode.type === 'nat_type_full_cone_nat') {
      return 1;
    }

    if (srvNode.type === 'nat_type_restrict_cone_nat') {
      return 1;
    }
  }

  return 0;
}

function natNodeDup(natNode, matchNodes) {
  for (let i = 0; i < matchNodes.length; i++) {
    if (natNode.pubIP === matchNodes[i].pubIP &&
      natNode.localIP === matchNodes[i].localIP) {
      return 1;
    }
  }

  return 0;
}

function searchMatchNodes(natNode) {
  let matchNodes = [];
  let natNodesArray;
  let dstCountry = natNode.dstCountry;

  log.debug('start to find match node for nat node:');
  printNatNode(natNode);

  natNodesArray = ctryNodesMap.get(dstCountry);
  if (!natNodesArray) {
    log.debug(`no nat nodes for country:${dstCountry}`);
    return null;
  }

  for (let i = 0; i < natNodesArray.length; i++) {
    if (natNodeMatch(natNode, natNodesArray[i])) {
      log.debug('find match node:');
      printNatNode(natNodesArray[i]);
      if (!natNodeDup(natNodesArray[i], matchNodes)) {
        matchNodes.push(natNodesArray[i]);
        log.debug('node is not duplicated');
      } else {
        log.debug('node is duplicated');
      }
    }
  }

  if (matchNodes.length === 0) {
    log.debug('found nothing');
    return null;
  }

  return matchNodes;
}

function printNatNode(natNode) {
  log.debug(`local ip:${natNode.localIP}, local port:${natNode.localPort}, \
pub ip:${natNode.pubIP}, pub port:${natNode.pubPort}, type:${natNode.type}, \
src:${natNode.srcCountry}, dst:${natNode.dstCountry}, ctrlTunID:${natNode.ctrlTunId}, \
asClient:${natNode.asClient}, asServer:${natNode.asServer}`);
}

async function startNodePunch(srcNode, dstNode, client, request, srvCountry) {
  let cmdStr = 'natPunchCtrl';

  let ipcMsg = {
    cmd: cmdStr,
    ctrlTunId: srcNode.ctrlTunId,
    peerIP: dstNode.pubIP,
    peerPort: dstNode.pubPort,
    localPort: srcNode.localPort,
    srvCountry: srvCountry,
    client: client,
    request: request,
  };

  const res = await dp.sendDpRequest(ipcMsg);
  if (!res) {
    return;
  } else if (res.status !== 'ok') {
    log.error(`status is not ok, it is ${res.status}`);
  } else {
    log.info(`cmd ${cmdStr} got ok response`);
  }
}

let natType2Num = (exports.natType2Num = function (natMode) {
  if (natMode === 'nat_type_full_cone_nat') {
    return 4;
  } else if (natMode === 'nat_type_restrict_cone_nat') {
    return 3;
  } else if (natMode === 'nat_type_port_restrict_cone_nat') {
    return 2;
  } else if (natMode === 'nat_type_sym_nat') {
    return 1;
  } else {
    return 0; //don't do nat traversal
  }
});

async function doNatTraversal(cliNode, srvNode) {
  let cliRequest = 1;
  let srvRequest = 0;

  log.debug('Two nodes will do nat traversal');
  log.debug('cli node:');
  printNatNode(cliNode);
  log.debug('srv node:');
  printNatNode(srvNode);

  if (cliNode.pubIP === srvNode.pubIP) {
    log.debug('err - cli pub ip is the same as srv pub ip');
    return;
  }

  let cliNatTypeNum = natType2Num(cliNode.type);
  let srvNatTypeNum = natType2Num(srvNode.type);

  if (cliNatTypeNum > srvNatTypeNum) {
    log.debug(`cli ${cliNode.type}, srv ${srvNode.type}, use reverse connect`);
    cliRequest = 0;
    srvRequest = 1;
  } else {
    log.debug(`cli ${cliNode.type}, srv ${srvNode.type}, use forward connect`);
  }

  await startNodePunch(cliNode, srvNode, 1, cliRequest, cliNode.dstCountry);
  await startNodePunch(srvNode, cliNode, 0, srvRequest, cliNode.dstCountry);
}

function timeoutNatNode() {
  let now = Date.now();
  let natNodesArray;

  for (let [k, v] of ctryNodesMap) {
    log.debug(`timeout starts for country ${k}`);
    natNodesArray = v;
    if (!natNodesArray) {
      continue;
    }

    for (let i = natNodesArray.length - 1; i >= 0; i--) {
      let e = natNodesArray[i];
      if (now > e.ts + config.NAT_NODE_EXPIRE_TIME_MS) {
        log.debug(`remove expired entry for ${k}`);
        printNatNode(e);
        natNodesArray.splice(i, 1);
      } else {
        log.debug(`entry of ${k} is not expired`);
        printNatNode(e);
      }
      e = null; //free the object???
    }
  }
}

/* only ctrl server call this function */
exports.procNatBroadcast = async function (msg) {
  let natNode = {};
  let matchNodesArray;
  natNode.localIP = msg.localIP;
  natNode.localPort = msg.localPort;
  natNode.pubIP = msg.pubIP;
  natNode.pubPort = msg.pubPort;
  natNode.type = msg.natType;
  natNode.ts = Date.now(); //ms
  natNode.dstCountry = msg.dstCountry;
  natNode.ctrlTunId = msg.nodeId;
  natNode.asClient = parseInt(msg.asClient);
  natNode.asServer = parseInt(msg.asServer);
  natNode.srcCountry = await system.lookupCountry(msg.pubIP);

  log.debug('----------------------------------------');
  log.debug('get new nat node');
  printNatNode(natNode);

  timeoutNatNode();

  if (natNode.asServer) {
    log.debug('save nat node as server');
    printNatNode(natNode);
    saveNatNode(natNode);
  }

  if (natNode.asClient) {
    log.debug('do nat traversal as client');
    printNatNode(natNode);

    matchNodesArray = searchMatchNodes(natNode);
    if (!matchNodesArray) {
      return;
    }

    for (let matchNode of matchNodesArray) {
      await doNatTraversal(natNode, matchNode);
    }
  }
};

exports.natTraversalThread = async function () {
  let natMode;
  let natType;
  let trafficMode = env.getTrafficMode();

  log.info('start natTraversalThread...');

  natMode = await dp.natDetect();

  if (natModeValid(natMode)) {
    log.info(`nat mode is detected ${natMode}`);
  } else {
    log.info(`nat mode err: ${natMode}, give up...`);
    return;
  }

  natType = natType2Num(natMode);

  if (natType) {
    while (true) {
      await natBroadcastLoop(natType);
      await system.delayPromise(config.NAT_BROADCAST_INTERVAL);
    }
  } else {
    log.info(
      `Do not connect to ctrl servers: traffic: ${trafficMode}, nat: ${natMode}`
    );
  }
};

module.exports.countryNodeMap = ctryNodesMap;
