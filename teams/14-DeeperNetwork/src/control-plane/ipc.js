'use strict';

const dgram = require('dgram');
const config = require('./config');
const dp = require('./dp');
const mp = require('./mp');
const log = require('../common-js/log');
const util = require('../common-js/util');

let ipcSocket = null;

exports.createIpcSocket = function () {
  if (ipcSocket !== null) {
    return true;
  }

  try {
    ipcSocket = dgram.createSocket('udp4');
    ipcSocket.bind(config.CP_CTRL_PORT, config.IPC_LISTEN_IP);
  } catch (e) {
    log.error('Failed to create udp socket:' + e);
    return false;
  }

  if (!ipcSocket) {
    log.error('IPC socket has not created yet');
    return false;
  }

  ipcSocket.on('listening', function () {
    log.info('ipc is listening on port ' + config.CP_CTRL_PORT);
  });

  ipcSocket.on('message', recvIpcMsg);

  ipcSocket.on('error', function (err) {
    log.error('ipc error:' + err);
  });

  return true;
};

exports.socketCreated = function () {
  return ipcSocket !== null;
};

async function recvIpcMsg(msg, rinfo) {
  let ipcMsg;

  try {
    ipcMsg = JSON.parse(msg);
  } catch (err) {
    log.error(`Failed to parse IPC message: ${msg.toString()}`);
    return false;
  }

  if (ipcMsg === null) {
    log.error('IPC message is not correct:' + msg.toString());
    return false;
  }

  if (!ipcMsg.cmd || !ipcMsg.src || !ipcMsg.dst) {
    log.error(`Broken msg ${msg.toString()}`);
    return false;
  }

  if (ipcMsg.dst !== 'cp') {
    log.error(`Msg not for cp ${JSON.stringify(ipcMsg)}`);
    return false;
  }

  /* debug info */
  log.debug(`recv msg ${JSON.stringify(ipcMsg)}`);

  if (ipcMsg.src === 'dp') {
    if (rinfo.port !== config.DP_IPC_PORT) {
      log.error(`wrong dp port ${rinfo.port}`);
      return false;
    }

    await dp.recvDPMsg(ipcMsg);
  } else if (ipcMsg.src === 'mp') {
    if (rinfo.port !== config.MP_IPC_PORT) {
      log.error(`wrong mp port ${rinfo.port}`);
      return false;
    }

    await mp.recvMPMsg(ipcMsg);
  } else {
    log.error(`IPC src is invalid ${JSON.stringify(ipcMsg)}`);
    return false;
  }

  return true;
}

function sendIpcMsg(ipcMsg, port) {
  /* debug info */
  log.debug(`send msg ${JSON.stringify(ipcMsg)}`);

  let msgStr = JSON.stringify(ipcMsg);
  if (!msgStr) {
    log.error('ipc msg format is invalid');
    return false;
  }

  try {
    ipcSocket.send(Buffer.from(msgStr), 0, msgStr.length, port, config.IPC_LISTEN_IP);
    return true;
  } catch (err) {
    log.error(`Failed to send msg ${msgStr}`);
    return false;
  }
}

/* send request and wait for response */
exports.sendRequest = async function (ipcMsg, port, timeoutMs, pubKey) {
  let requestId = util.newRequestId(pubKey);

  ipcMsg.requestId = requestId;
  ipcMsg.msgType = 'request';

  let promise = new Promise(function (resolve, reject) {
    let ret = sendIpcMsg(ipcMsg, port);
    if (ret === false) {
      reject(`Failed to send msg ${JSON.stringify(ipcMsg)}`);
    } else {
      ipcSocket.once(requestId, procRsp);
    }

    function procRsp(resp) {
      resolve(resp);
    }
  });

  function timeoutCallback() {
    ipcSocket.removeAllListeners(requestId);
  }

  return util.promiseWithTimeout(promise, timeoutMs, (resolve, reject) => {
    timeoutCallback();
    reject(new Error('Operation timed out after ' + timeoutMs + ' ms'));
  });
};

exports.sendResponse = function (req, data, port) {
  let ipcMsg = {
    src: 'cp',
    dst: req.src,
    cmd: req.cmd,
    data: data,
    requestId: req.requestId,
    msgType: 'response'
  };

  return sendIpcMsg(ipcMsg, port);
};

exports.sendNotify = function (ipcMsg, port) {
  ipcMsg.msgType = 'notify';
  return sendIpcMsg(ipcMsg, port);
};

exports.socketEmit = function (event, ipcMsg) {
  ipcSocket.emit(event, ipcMsg);
};

exports.socketOnce = function (event, callback) {
  ipcSocket.once(event, callback);
};

exports.socketRemoveAllListeners = function (event) {
  ipcSocket.removeAllListeners(event);
};
