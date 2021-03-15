'use strict';

const to = require('await-to-js').default;

const tun = require('./tunnel');
const env = require('./env');
const config = require('./config');
const ipc = require('./ipc');
const nat = require('./nat');
const log = require('../common-js/log');
const util = require('../common-js/util');
const chain = require('./chain');
const tunnel = require('./tunnel');

const defaultRequestTimeout = 3000;
const reqWithDiffResCmdList = ['tunC2sSetup', 'tunS2cSetup']; // a list of requests whose responses have a different cmd

exports.recvDPMsg = async function (ipcMsg) {
  await procCommonMsg(ipcMsg);

  if (ipcMsg.msgType === 'request') {
    await procRequest(ipcMsg);
  } else if (ipcMsg.msgType === 'response') {
    await procResponse(ipcMsg);
  } else if (ipcMsg.msgType === 'notify') {
    await procNotify(ipcMsg);
  } else {
    log.error(`unknown dp msg ${JSON.stringify(ipcMsg)}`);
  }
};

async function procRequest(ipcMsg) {
  /* no defined requests from dp to cp yet */
  switch (ipcMsg.cmd) {
    default:
      log.error(`unknown dp request ${JSON.stringify(ipcMsg)}`);
  }
}

async function procResponse(ipcMsg) {
  if (!ipcMsg.requestId) {
    log.error(`Get response without requestId: ${JSON.stringify(ipcMsg)}`);
    return;
  }

  /* emit socket event to trigger response processing */
  ipc.socketEmit(ipcMsg.requestId, ipcMsg);
}

async function procNotify(ipcMsg) {
  switch (ipcMsg.cmd) {
    case 'tunEstablished':
      break;
    case 'tunClosed':
      break;
    case 'natBroadcast':
      await nat.procNatBroadcast(ipcMsg);
      break;
    case 'tunSendJson':
      const deviceKeyPair = env.getKeyPair();
      if (deviceKeyPair) {
        await procTunSendJson(ipcMsg, deviceKeyPair);
      }
      break;
    case 'cpRestart':
      log.info('receive cp restart command, exit to restart');
      process.exit(3);
      break;
    default:
      log.error(`unknown dp notify ${JSON.stringify(ipcMsg)}`);
      break;
  }

  return true;
}

async function procTunSendJson(msg, receiverKeypair) {
  let parsed = util.parseJSONSafely(msg.jsonPayload);
  if (!parsed.msgType) {
    log.info('procTunSendJson: received json is invalid');
    return false;
  }
  log.info(`procTunSendJson: recv json msg ${JSON.stringify(parsed)}`);
  let tunId = msg.nodeId;
  switch (parsed.msgType) {
    case 'micropayment':
      let isValid = await chain.verifyMicropayment(parsed.senderAddress, parsed.receiverAddress, parsed.nonce, parsed.sessionId, parsed.amount, parsed.signature);
      if(!isValid) {
        log.info('procTunSendJson: invalid micropayment message');
        const tunnels = tunnel.getTunnels(0, 0);
        let senderAddress = tunnels[tunId]['pubKey'];
        await chain.closeMicropayment(senderAddress, receiverKeypair);
        env.removeServerClaimedTraffic(tunId);
        await tunnel._teardownTunnel(0, 0, tunId);
        return false;
      } else {
        let traffic = await exports.getTunTraffic(tunId);
        let claimedTraffic = env.getServerClaimedTraffic(tunId);
        if((traffic - claimedTraffic) * config.DATA_TO_DPR_RATIO >= parsed.amount) {
          log.info('procTunSendJson: micropayment message is valid, claiming...');
          await chain.claimMicropayment(parsed.senderAddress, receiverKeypair, parsed.sessionId, parsed.amount, parsed.signature);
          env.increaseServerClaimedTraffic(tunId, parsed.amount);
        }else{
          log.info('procTunSendJson: micropayment pay too much');
          const tunnels = tunnel.getTunnels(0, 0);
          let senderAddress = tunnels[tunId]['pubKey'];
          await chain.closeMicropayment(senderAddress, receiverKeypair);
          env.removeServerClaimedTraffic(tunId);
          await tunnel._teardownTunnel(0, 0, tunId);
          return false;
        }
      }
      break;
    default:
      break;
  }
  return true;
}

async function procCommonMsg(ipcMsg) {
  switch (ipcMsg.cmd) {
    case 'tunEstablished':
      if (!ipcMsg.nodeId) {
        log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
        return;
      }
      let reqId = util.parseJSONSafely(ipcMsg.requestId);
      log.info(`ipcMsg.requestId: ${ipcMsg.requestId}, parse reqId: ${ipcMsg.requestId}, pubkey: ${reqId.pubKey}`);
      await tun.addTunnel(ipcMsg.nodeId, reqId.pubKey, ipcMsg.peerIp, ipcMsg.peerPort,
        ipcMsg.region, ipcMsg.ctrlTun, ipcMsg.cliTun, ipcMsg.reqTun, ipcMsg.natTun);
      break;
    case 'tunClosed':
      if (!ipcMsg.nodeId) {
        log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
        return;
      }
      log.info(`receive tunClosed msg, ${JSON.stringify(ipcMsg)}`);
      tun.delTunnel(ipcMsg.nodeId, ipcMsg.ctrlTun, ipcMsg.cliTun);
      break;
    default:
      break;
  }
}

exports.getTunStatus = async function (tunId) {
  let cmd = 'tunStatusGet';
  let ipcMsg = {
    cmd: cmd,
    nodeId: tunId,
  };

  const res = await sendDpRequest(ipcMsg);
  if (!res) {
    return null;
  } else if (res.nodeId !== tunId) {
    log.error(`tun id not match ${tunId} !== ${res.nodeId}`);
    return null;
  }
  return res.status;
};

exports.getTunTraffic = async function (tunId) {
  const msg = {
    cmd: 'tunTrafficGet',
    nodeId: tunId,
  };

  const res = await sendDpRequest(msg);
  if (res && res.status === 'valid') {
    return parseInt(res.traffic);
  } else {
    log.error(`Failed to get traffic for tunnel ${tunId}: ${JSON.stringify(res)}`);
    return null;
  }
};

exports.setupTunnel = async function (pubKey, ip, port, country, ctrl, cli) {
  let ipcMsg;
  if (cli) {
    ipcMsg = {
      cmd: 'tunC2sSetup',
      region: country,
      srvIp: ip,
      srvPort: port,
      ctrlTun: ctrl,
    };
  } else {
    ipcMsg = {
      cmd: 'tunS2cSetup',
      region: country,
      cliIp: ip,
      cliPort: port,
      ctrlTun: ctrl,
    };
  }

  const res = await sendDpRequest(ipcMsg, 5000, pubKey);
  if (!res) {
    log.error(`setupTunnel pubKey:${pubKey} ${ip}:${port} ${country} ctrl:${ctrl} cli:${cli} error`);
    return false;
  } else if (res.cmd === 'tunEstablished') {
    return true;
  }
  log.error(`unexpected cmd ${res.cmd}`);
  return false;
};

exports.teardownTunnel = async function (tunId) {
  let cmd = 'tunTeardown';
  let ipcMsg = {
    cmd: cmd,
    nodeId: tunId,
  };

  const res = await sendDpRequest(ipcMsg);
  if (!res) {
    return false;
  } else if (res.status !== 'ok') {
    log.error(`status is not ok, it is ${res.status}`);
    return false;
  }
  return true;
};

exports.askSysInfo = async function () {
  let cmd = 'getSys';
  let ipcMsg = {
    cmd: cmd,
  };

  const res = await sendDpRequest(ipcMsg);
  if (!res) {
    return null;
  }
  return res;
};

exports.natDetect = async function () {
  let cmd = 'natDetect';
  let ipcMsg = {
    cmd: cmd,
  };

  const res = await sendDpRequest(ipcMsg, 8000);
  if (!res) {
    return null;
  }
  return res.value;
};

exports.natMap = async function () {
  let cmd = 'natMap';
  let ipcMsg = {
    cmd: cmd,
  };

  const res = await sendDpRequest(ipcMsg, 2000);
  if (!res) {
    return null;
  }

  return {
    pubIP: env.internalTestMode() ? env.getDPIP() : res.pubIP,
    pubPort: res.pubPort,
    localIP: res.localIP,
    localPort: res.localPort,
  };
};

exports.setPubIP = async function (ip) {
  let cmd = 'pubIPSet';
  let ipcMsg = {
    cmd: cmd,
    ip: ip
  };

  const res = await sendDpRequest(ipcMsg);
  if (!res) {
    return false;
  } else if (res.status !== 'ok') {
    log.error(`${cmd} status is not ok, it is ${res.status}`);
    return false;
  }
  return true;
};

async function __natBroadcast(tunId, localIP, localPort, pubIP, pubPort, dstCountry, asClient, asServer) {
  let cmdStr = 'natBroadcast';

  let ipcMsg = {
    cmd: cmdStr,
    nodeId: tunId,
    localIP: localIP,
    localPort: localPort,
    pubIP: pubIP,
    pubPort: pubPort,
    asClient: asClient,
    asServer: asServer,
    dstCountry: dstCountry,
  };

  const res = await sendDpRequest(ipcMsg);
  if (!res) {
    return false;
  } else if (res.status !== 'ok') {
    log.error(`${cmdStr} status is not ok, it is ${res.status}`);
    return false;
  }
  return true;
}

exports.natBroadcast = async function (localIP, localPort, pubIP, pubPort, dstCountry, asClient, asServer) {
  let tunId;
  let ret;
  let res = true;

  for (tunId in tun.getTunnels(true, true)) {
    ret = await __natBroadcast(tunId, localIP, localPort, pubIP, pubPort,
      dstCountry, asClient, asServer);
    if (!ret) {
      log.error(`nat broadcast to ${tunId} failed`);
      res = false;
    } else {
      log.debug(`nat broadcast to tunnel ${tunId}, ${localIP}:${localPort} => ${pubIP}:${pubPort} OK`);
    }
  }

  return res;
};

const sendDpRequest = (exports.sendDpRequest = async function (ipcMsg, timeoutMs, pubKey) {
  ipcMsg.src = 'cp';
  ipcMsg.dst = 'dp';
  timeoutMs = timeoutMs || defaultRequestTimeout;
  const [err, res] = await to(ipc.sendRequest(ipcMsg, config.DP_IPC_PORT, timeoutMs, pubKey));

  if (err) {
    log.error(`Failed to send request ${ipcMsg.cmd}: ${err}`);
    return false;
  } else if (reqWithDiffResCmdList.indexOf(ipcMsg.cmd) >= 0) {
    /* requests in this list do not require a matching cmd */
    return res;
  } else if (res.cmd !== ipcMsg.cmd) {
    log.error(`Mismatch cmd: ${ipcMsg.cmd} !== ${res.cmd}`);
    return false;
  } else {
    return res;
  }
});
