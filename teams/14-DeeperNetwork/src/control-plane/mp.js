'use strict';

const to = require('await-to-js').default;

const ipc = require('./ipc');
const tunnel = require('./tunnel');
const config = require('./config');
const worldMap = require('./worldMap');
const env = require('./env');
const system = require('./system');
const log = require('../common-js/log');
const chain = require('./chain');
const init = require('./init');

const DEFAULT_REQUEST_TIMEOUT = 5000;

exports.recvMPMsg = async function (ipcMsg) {
  if (ipcMsg.msgType === 'request') {
    await procRequest(ipcMsg);
  } else if (ipcMsg.msgType === 'response') {
    await procResponse(ipcMsg);
  } else if (ipcMsg.msgType === 'notify') {
    await procNotify(ipcMsg);
  } else {
    log.error(`unknown mp msg ${JSON.stringify(ipcMsg)}`);
  }
};

async function procRequest(ipcMsg) {
  switch (ipcMsg.cmd) {
    case 'getTunnelActiveInfo':
      await getTunnelActiveInfo(ipcMsg);
      break;
    case 'addTunnel':
      await addTunnel(ipcMsg);
      break;
    case 'deleteTunnels':
      await deleteTunnels(ipcMsg);
      break;
    case 'getCountry':
      await getCountry(ipcMsg);
      break;
    case 'getWorldMapData':
      await getWorldMapData(ipcMsg);
      break;
    case 'switchTunnelNode':
      await switchTunnelNode(ipcMsg);
      break;
    case 'setPocDelegationMode':
      await setPocDelegationMode(ipcMsg);
      break;
    case 'getCandidateValidatorList':
      await getCandidateValidatorList(ipcMsg);
      break;
    case 'setSelectedValidator':
      await setSelectedValidator(ipcMsg);
      break;
    case 'getSelectedValidator':
      await getSelectedValidator(ipcMsg);
      break;
    case 'getBalanceAndScore':
      await getBalanceAndScore(ipcMsg);
      break;
    case 'getCanStakingInfo':
      await getCanStakingInfo(ipcMsg);
      break;
    case 'transferFund':
      await transferFund(ipcMsg);
      break;
    case 'getTotalChannelBalance':
      await getTotalChannelBalance(ipcMsg);
      break;
    default:
      log.error(`unknown mp request ${JSON.stringify(ipcMsg)}`);
      break;
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
    case 'listTunnels':
      await listTunnels(ipcMsg);
      break;
    case 'reportPrivateKey':
      await init.initWallet(ipcMsg.params.decrypted);
      break;
    default:
      log.error(`unknown mp notify ${JSON.stringify(ipcMsg)}`);
      break;
  }
}

async function getTunnelActiveInfo(ipcMsg) {
  if (!ipcMsg.params || !ipcMsg.params.tunnels) {
    log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
    return;
  }

  let data = {};
  for (let rgn of ipcMsg.params.tunnels) {
    /* count cli data tunnels */
    const activeNum = tunnel.getTunnelNumByRegion(rgn, 0, 1);
    const activeIp = await tunnel.getActiveIpByRegion(rgn);
    data[rgn] = {
      activeNum: activeNum,
      activeIp: activeIp,
    };
  }

  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

async function addTunnel(ipcMsg) {
  if (!ipcMsg.params || !ipcMsg.params.tunnelCode) {
    log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
    return;
  }

  let data = {};
  let ret = await tunnel.addRegion(ipcMsg.params.tunnelCode);
  if (ret) {
    data.status = 'ok';
  } else {
    data.status = 'error';
  }

  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

async function deleteTunnels(ipcMsg) {
  if (!ipcMsg.params || !ipcMsg.params.tunnels) {
    log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
    return;
  }

  let data = {};
  let success = true;
  for (let rgn of ipcMsg.params.tunnels) {
    let ret = await tunnel.deleteRegion(rgn);
    if (!ret) {
      log.error(`delete tunnels for ${rgn} error`);
      success = false;
    }
  }

  if (success) {
    data.status = 'ok';
  } else {
    data.status = 'error';
  }

  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

async function listTunnels(ipcMsg) {
  if (!ipcMsg.params || !ipcMsg.params.tunnels) {
    log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
    return;
  }

  for (let rgn of ipcMsg.params.tunnels) {
    await tunnel.addRegion(rgn);
  }
}

async function getCountry(ipcMsg) {
  let country;
  while (!country) {
    country = env.getMyCountry();
    if (!country) {
      await system.delayPromise(1000);
    }
  }
  ipc.sendResponse(ipcMsg, country, config.MP_IPC_PORT);
}

async function getWorldMapData(ipcMsg) {
  let data = await worldMap.getWorldMapData();
  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

async function switchTunnelNode(ipcMsg) {
  if (!ipcMsg.params || !ipcMsg.params.tunnelCode || !ipcMsg.params.currentIp) {
    log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
    return;
  }

  const data = await tunnel.switchNode(ipcMsg.params.tunnelCode, ipcMsg.params.currentIp);
  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

async function setPocDelegationMode(ipcMsg){
  if(!ipcMsg.params || !ipcMsg.params.mode){
    log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
    const data = {
      res:false,
      message:'params is null'
    }
    ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
    return;
  }
  if(ipcMsg.params.mode == env.POC_DELEGATION_MODES.AUTO || ipcMsg.params.mode == env.POC_DELEGATION_MODES.MANUAL){
    env.setPocDelegationMode(ipcMsg.params.mode);
    const data = {
      res:true,
      message:'set Poc delegation mode successfully'
    }
    ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
  }else{
    const data = {
      res:false,
      message:'params is not auto or manual'
    }
    ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
    log.error(`PoC Delegation Mode from MP is Error: ${ipcMsg.params.mode}`);
  }
}

async function getCandidateValidatorList(ipcMsg){
  const candidateValidators = await chain.getCandidateValidators();
  ipc.sendResponse(ipcMsg, candidateValidators, config.MP_IPC_PORT);
}

async function setSelectedValidator(ipcMsg){
  const deviceKeyPair = env.getKeyPair();
  if (!deviceKeyPair) {
    log.error('Unexpected message "setSelectedValidator" received: device not bound');
    return;
  }

  if(!ipcMsg.params || !ipcMsg.params.validators){
    log.error(`broken msg ${JSON.stringify(ipcMsg)}`);
    const data = {
      res:false,
      message:'params is null'
    }
    ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
    return;
  }else{
    let validators = ipcMsg.params.validators;
    if (validators && validators.length <= config.POC_DELEGATION_MAX_VALIDATORS){
      const res = await chain.delegate(validators, deviceKeyPair);
      const data = {
        res:res,
        message: res?'delegate successfully':'delegate failed'
      }
      ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
    }else{
      log.error('validators error');
      const data = {
        res:false,
        message:'validators length is too much'
      }
      ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
    }
  }
}

async function getSelectedValidator(ipcMsg){
  const deviceKeyPair = env.getKeyPair();
  if (!deviceKeyPair) {
    log.error('Unexpected message "getSelectedValidator" received: device not bound');
    return;
  }

  const validators = await chain.getDelegatedValidators(deviceKeyPair);
  ipc.sendResponse(ipcMsg, validators, config.MP_IPC_PORT);
}

async function getBalanceAndScore(ipcMsg){
  const deviceKeyPair = env.getKeyPair();
  if (!deviceKeyPair) {
    log.error('Unexpected message "getBalanceAndScore" received: device not bound');
    return;
  }

  const score = await chain.getScore(deviceKeyPair);
  const balance = await chain.getBalance(deviceKeyPair.address);
  const data = {
    score: score,
    balance: balance
  }
  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

async function getTotalChannelBalance(ipcMsg) {
  const deviceKeyPair = env.getKeyPair();
  if (!deviceKeyPair) {
    log.error('Unexpected message "getTotalChannelBalance" received: device not bound');
    return;
  }

  // get all receiver address of micropayment channel
  const tunnels = tunnel.getTunnels(0, 1);
  let channelReceiverAddressList = [];
  for (let tunId in tunnels) {
    let receiverAddr = tunnels[tunId]['pubKey'];
    if (receiverAddr) {
      channelReceiverAddressList.push(receiverAddr);
    }
  }

  const balance = await chain.getTotalChannelBalance(deviceKeyPair.address, channelReceiverAddressList);
  ipc.sendResponse(ipcMsg, balance, config.MP_IPC_PORT);
}

async function getCanStakingInfo(ipcMsg){
  const data = {
    canStaking: await chain.canStaking()
  }
  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

async function transferFund(ipcMsg) {
  const deviceKeyPair = env.getKeyPair();
  if (!deviceKeyPair) {
    log.error('Unexpected "transferFund" message: device not bound');
    return;
  }

  if (!ipcMsg.params || !ipcMsg.params.recipient || !ipcMsg.params.amount) {
    log.error(`Broken "transferFund" message: Recipient or amount missing`);
    return;
  }

  if (deviceKeyPair.address === ipcMsg.params.recipient) {
    log.error(`Broken "transferFund" message: Sender and recipient the same`);
    return;
  }

  const error = await chain.transfer(deviceKeyPair, ipcMsg.params.recipient, ipcMsg.params.amount);
  const data = error ? {
    success: false,
    error,
  } : {
    success: true,
  };

  ipc.sendResponse(ipcMsg, data, config.MP_IPC_PORT);
}

exports.askConfig = function () {
  let cmd = 'askCPConfig';
  let ipcMsg = {
    src: 'cp',
    dst: 'mp',
    cmd: cmd,
  };
  ipc.sendNotify(ipcMsg, config.MP_IPC_PORT);
};

exports.sendMpRequest = async (cmd, params, timeoutMs) => {
  const ipcMsg = {
    src: 'cp',
    dst: 'mp',
    cmd: cmd,
    params: params,
  };

  timeoutMs = timeoutMs || DEFAULT_REQUEST_TIMEOUT;
  const [err, res] = await to(ipc.sendRequest(ipcMsg, config.MP_IPC_PORT, timeoutMs));

  if (err) {
    log.error(`Failed to send request ${cmd}: ${err}`);
    return false;
  } else if (res.cmd !== cmd) {
    log.error(`Mismatch cmd: ${res.cmd} !== ${cmd}`);
    return false;
  } else {
    return res;
  }
};

exports.getPrivateKey = async () => {
  const res = await exports.sendMpRequest('getPrivateKey');
  return res && res.data;
};
