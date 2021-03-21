'use strict';

const system = require('./system');
const CryptoJS = require('crypto-js');
const log = require('../common-js/log');
const env = require('./env');
const config = require('./config');
const util = require('../common-js/util');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const region = require('../common-js/region');
const { Keyring } = require('@polkadot/api');
const { blake2AsU8a, cryptoWaitReady, signatureVerify } = require('@polkadot/util-crypto');
const BN = require('bn.js');

const DPR = 1000000000000000; // base = 1e15 according to frontend apps, in code it's 1e14, fix it later;
const ONE_MILLION = 1000000;

let apiPromise;

function getApiPromise() {
    let url = config.HACKATHON_URL[Math.floor(Math.random() * config.HACKATHON_URL.length)];
    if (env.internalTestMode()) {
        url = config.DOCKER_CHAIN_URL;
    }
    log.info(`connecting to blockchain at ${url}`);
    // TODO: process.env is not suggested.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const wsProvider = new WsProvider(url);

    return ApiPromise.create({
        provider: wsProvider,
        types: {
            Balance: "u128",
            Timestamp: "Moment",
            BlockNumber: "u32",
            IpV4: "Vec<u8>",
            CountryRegion: "Vec<u8>",
            Duration: "u8",
            Node: {
                account_id: "AccountId",
                ipv4: "IpV4",
                country: "CountryRegion",
                expire: "BlockNumber"
            },
            ChannelOf: {
                sender: "AccountId",
                receiver: "AccountId",
                balance: "Balance",
                nonce: "u64",
                opened: "BlockNumber",
                expiration: "BlockNumber"
            },
            CreditDelegateInfo: {
                delegator: "AccountId",
                score: "u64",
                validators: "Vec<AccountId>"
            }
        },
    });
}

async function getApi() {
  if (!apiPromise) {
    apiPromise = getApiPromise();
  }

  const api = await util.promiseWithTimeout(apiPromise, config.API_WAIT_TIME, resolve => {
    resolve(null);
  });

  return api;
}

// duration unit: day
exports.registerServer = async function (duration, deviceKeyPair) {
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }

    const err = await sendTxn(api.tx.deeperNode.registerServer(duration), deviceKeyPair, -1, api, true, true, 'registerServer');
    if (err) {
        log.error(`Failed to register server: ${err}`);
        return false;
    }
    return true;
};

// duration unit: day
exports.update = async function (duration, deviceKeyPair) {
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }

    const err = await sendTxn(api.tx.deeperNode.updateServer(duration), deviceKeyPair, -1, api);
    if (err) {
        log.error(`${deviceKeyPair.address} failed to update server: ${err}`);
        return false;
    }

    log.info(`${deviceKeyPair.address} updated server with duration ${duration}`);
    return true;
};

exports.registerIP = async function (ip, country, deviceKeyPair) {
    if (!region.isValidCountry(country)) {
        log.error(`invalid country code ${country}`);
        return false;
    }
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }

    let deviceInfo = await api.query.deeperNode.deviceInfo(deviceKeyPair.address);
    log.info(`deviceInfo.ipv4: ${deviceInfo.ipv4}`);
    if (deviceInfo.ipv4 == "0x") {
       log.info('register device on blockchain....');
       let encryptedIP = CryptoJS.AES.encrypt(ip, config.IP_PSK).toString();

      const err = await sendTxn(api.tx.deeperNode.registerDevice(encryptedIP, country), deviceKeyPair, -1, api);
      if (err) {
        log.error(`Failed to register ${deviceKeyPair.address} with ip ${ip}, country ${country}, encrypted ip ${encryptedIP}, err: ${err}`);
        return false;
      }

      log.info(`${deviceKeyPair.address} registered with ip ${ip}, country ${country}, encrypted ip ${encryptedIP}`);
      return true;
    } 
    return true;
};


exports.register = async function (ip, country, duration, deviceKeyPair) {
  if (env.getTrafficMode() !== env.TRAFFIC_MODES.ONEARM && env.deeperChainMode()) {
     let ret = await exports.registerIP("", country, deviceKeyPair);
     if (!ret) {
       log.error(`[chain] register: failed to register as client in ${country}`);
       return false;
     }
     return true;
  }

  let ret = await exports.registerIP(ip, country, deviceKeyPair);
  if (!ret) {
    log.error(`failed to register ${ip} ${country}`);
    return false;
  }
  log.info(`successfully registered ${ip} ${country}`);

  /* TODO: Need to sleep for a block time; otherwise, the following chain.register will fail. */
  await system.delayPromise(10000);

  ret = await exports.registerServer(duration, deviceKeyPair);
  if (!ret) {
    log.error('failed to register server');
    return false;
  }
  log.info(`successfully registered server with duration ${duration}`);
  return true;
}


exports.unregisterServer = async function (deviceKeyPair) {
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return;
    }

    const err = await sendTxn(api.tx.deeperNode.unregisterServer(), deviceKeyPair, -1, api);
    if (err) {
        log.error(`${deviceKeyPair.address} failed to unregister server: ${err}`);
        return;
    }
    log.info(`${deviceKeyPair.address} unregistered server`);
};

exports.unregisterIP = async function (deviceKeyPair) {
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return;
    }

    const err = await sendTxn(api.tx.deeperNode.unregisterDevice(), deviceKeyPair, -1, api);
    if (err) {
        log.error(`${deviceKeyPair.address} failed to unregister: ${err}`);
        return;
    }
    log.info(`${deviceKeyPair.address} unregistered`);
};

async function getLastBlockNumber(api) {
    const signedBlock = await api.rpc.chain.getBlock();
    return parseInt(signedBlock.block.header.number.toString());
}

let getServersByCountry = (exports.getServersByCountry = async function (country) {
    if (!region.isValidCountry(country)) {
        log.error(`invalid country code ${country}`);
        return null;
    }
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return null;
    }
    const lastBlockNum = await getLastBlockNumber(api);
    let servers = await api.query.deeperNode.serversByCountry(country);
    if (servers.length === 0) {
        log.error(`no servers on chain for country ${country}, servers: ${servers}`);
        return null;
    }
    let numServers = Math.min(servers.length, config.NUM_SERVERS);
    servers = util.shuffle(servers);
    let ips = {};
    let idx = 0;
    for (let i = 0; i < servers.length && idx < numServers; i++) {
        const server = await api.query.deeperNode.deviceInfo(servers[i]);
        if (parseInt(server.expire.toString()) > lastBlockNum) {
            const ipStr = server.ipv4.toString('16');
            let encryptedIP = '';
            for (let j = 1; j < ipStr.length / 2; j++) {
                encryptedIP += String.fromCharCode(parseInt(ipStr.substring(2 * j, 2 * j + 2), 16));
            }
            let decryptedIP = CryptoJS.AES.decrypt(encryptedIP, config.IP_PSK).toString(CryptoJS.enc.Utf8);
            let countryStr = server.country.toString('16');
            let decryptedCountry = '';
            for (let j = 1; j < countryStr.length / 2; j++) {
                decryptedCountry += String.fromCharCode(parseInt(countryStr.substring(2 * j, 2 * j + 2), 16));
            }
            if (decryptedCountry === country) {
                ips[decryptedIP] = {
                    accountId: servers[i],
                    country: country,
                    type: 0,
                };
                idx++;
            } else {
                log.error(`decrypted country ${decryptedCountry} does not match ${country}`);
            }
        }
    }
    return ips;
});

exports.getServersByRegion = async function (rgn) {
    if (!region.isValidRgn(rgn)) {
        log.error(`invalid region code ${rgn}`);
        return null;
    }
    if (region.isValidCountry(rgn)) {
        return getServersByCountry(rgn);
    }
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return null;
    }
    const lastBlockNum = await getLastBlockNumber(api);
    let servers = await api.query.deeperNode.serversByRegion(rgn);
    if (servers.length === 0) {
        log.error(`no servers on chain for region ${rgn}`);
        return null;
    }
    let numServers = Math.min(servers.length, config.NUM_SERVERS);
    servers = util.shuffle(servers);
    let ips = {};
    let idx = 0;
    for (let i = 0; i < servers.length && idx < numServers; i++) {
        const server = await api.query.deeperNode.deviceInfo(servers[i]);
        if (parseInt(server.expire.toString()) > lastBlockNum) {
            const ipStr = server.ipv4.toString('16');
            let encryptedIP = '';
            for (let j = 1; j < ipStr.length / 2; j++) {
                encryptedIP += String.fromCharCode(parseInt(ipStr.substring(2 * j, 2 * j + 2), 16));
            }
            let decryptedIP = CryptoJS.AES.decrypt(encryptedIP, config.IP_PSK).toString(CryptoJS.enc.Utf8);
            let countryStr = server.country.toString('16');
            let decryptedCountry = '';
            for (let j = 1; j < countryStr.length / 2; j++) {
                decryptedCountry += String.fromCharCode(parseInt(countryStr.substring(2 * j, 2 * j + 2), 16));
            }
            ips[decryptedIP] = {
                accountId: servers[i],
                country: decryptedCountry,
                type: 0,
            };
            idx++;
        }
    }
    return ips;
};

async function printBalance(address) {
    if (!address) {
        log.error('address is undefined!');
        return
    }
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }
    let {data, nonce} = await api.query.system.account(address);
    if (!data) {
        log.error(`cannot query balance of ${address}`);
        return;
      }
    //let freeAmt = atomToDPR(data.free); 
    let freeAmt = atomToDPR(data.free); 
    //let reservedAmt = atomToDPR(data.reserved); 
    let reservedAmt = atomToDPR(data.reserved); 
    log.info(`free balance for ${address} is ${freeAmt} with ${reservedAmt} reserved and a nonce of ${nonce}`);

}

// convert number in "atom" unit to DPR unit
// return float
function atomToDPR(amt) {
  return amt/DPR;
}

// convert number in DPR unit to smallest "atom" unit 
function DPRToAtom(amt) {
  return BigInt(parseInt(amt * ONE_MILLION)) * BigInt(DPR / ONE_MILLION);
}

exports.getBalance = async function(address) {
  let api = await getApi();
  if (!api) {
        log.error('unable to get api');
        return false;
  }
  let bal = await api.query.system.account(address);
  let freeAmt = new BN(bal.data.free.toString(10), 10)/DPR;
  return freeAmt;
}

exports.getTotalChannelBalance = async function(address, receiverAddressList) {
  let api = await getApi();
  if (!api) {
        log.error('unable to get api');
        return false;
  }
  let totalChannelBalance = 0;

  for(var i=0; i<receiverAddressList.length; i++) {
      let channelInfo = await api.query.micropayment.channel([address, receiverAddressList[i]]);
      if (channelInfo && channelInfo.balance) {
        totalChannelBalance += atomToDPR(channelInfo.balance);
      } 
  }
  log.info(`total channel balance of ${address} is ${totalChannelBalance}`);
  return totalChannelBalance;
}

exports.airdrop = async function(address) {
  let api = await getApi();
  if (!api) {
        log.error('unable to get api');
        return false;
  }
  let amtNum = config.AIRDROP_AMT;
  let amt = DPRToAtom(amtNum);

  await cryptoWaitReady();
  const keyring = new Keyring({ type: "sr25519" });
  let root;
  if (env.deeperChainMode()) {
    root = keyring.addFromUri("//Alice");
  } else {
    root = keyring.addFromUri(config.ROOT_KEY);
  }
  log.info(`${log.line()} airdrop ${amtNum} to ${address}...`);

  const err = await sendTxn(api.tx.sudo.sudo(api.tx.balances.setBalance(address, amt, 0)), root, -1, api, true, true, 'airdrop');
  if (err) {
    log.error(`Failed to airdrop ${amtNum} to ${address}: ${err}`);
  }

  await system.delayPromise(10000);
  printBalance(address);
}

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

function numberToArray(number, encoding, size){
  let bnNum;
  if(!number.toArray) {
    bnNum = new BN(number.toString(), 10);
  } else {
    bnNum = number;
  }
  return bnNum.toArray(encoding, size);
}

function constructMicropaymentPayload(addr, nonceNum, sessionIdNum, amtNum) {
  let keyring = new Keyring();
  let pubkey = keyring.decodeAddress(addr);
  let arr = [];
  let nonce = numberToArray(nonceNum, "be", 8);
  let sessionId = numberToArray(sessionIdNum, "be", 4);
  let amount = DPRToAtom(amtNum);
  amount = numberToArray(amount, "le", 16); // amount is le encoded
  arr.push(...pubkey, ...nonce, ...sessionId, ...amount);
  let msg = blake2AsU8a(arr);
  return msg;
}

function constructMicropaymentSig(senderKeypair, addr, nonce, sessionIdNum, amtNum) {
  let msg = constructMicropaymentPayload(addr, nonce, sessionIdNum, amtNum);
  let signature = senderKeypair.sign(msg);
  let hexsig = toHexString(signature);
  return '0x' + hexsig;
}

async function openChannelIfNotExist(api, sender, receiverAddr, duration) {
  let res = await api.query.micropayment.channel([sender.address, receiverAddr]);
  if (!res || res.expiration == 0 ) {
    log.info('channel not exists, open channel...');
    let initialBalance = DPRToAtom(config.CHANNEL_INITIAL_BALANCE);

    const err = await sendTxn(api.tx.micropayment.openChannel(receiverAddr, initialBalance, config.CHANNEL_EXPIRATION_BLOCKS), sender, -1, api);
    if (err) {
      log.error(`Failed to open channel with receiver address ${receiverAddr} and initial balance ${initialBalance}: ${err}`);
    }

    env.setSessionId(0);
    await system.delayPromise(3000);
  }else{
    // addBalance
    if (atomToDPR(res.balance) < config.MICROPAYMENT_BALANCE_LOW_THRESHOD){
      let addBalance = DPRToAtom(config.CHANNEL_INITIAL_BALANCE - atomToDPR(res.balance));

      const err = await sendTxn(api.tx.micropayment.addBalance(receiverAddr, addBalance), sender, -1, api);
      if (err) {
        log.error(`Failed to add ${addBalance} to ${receiverAddr}: ${err}`);
      }

      await system.delayPromise(3000);
    }
  }
}

exports.constructMicropaymentMsg = async function(senderKeypair, receiverAddr, tunId, amount) {
  let api = await getApi();
  if (!api) {
        log.error('unable to get api');
        return false;
  }
  await openChannelIfNotExist(api, senderKeypair, receiverAddr); 
  let nonce = await api.query.micropayment.nonce([senderKeypair.address, receiverAddr]);
  let sessionId = env.getSessionId();
  env.setSessionId(sessionId+1);
  let hexsig = constructMicropaymentSig(senderKeypair, receiverAddr, nonce, sessionId, amount);
  let jsonPayload = {msgType: 'micropayment', signature: hexsig, senderAddress: senderKeypair.address, receiverAddress: receiverAddr, nonce: nonce, sessionId: sessionId, amount: amount};
  return jsonPayload;
}

exports.getScore = async function (deviceKeyPair) {
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }

    const scoreOption = await api.query.credit.userCredit(deviceKeyPair.address);
    return scoreOption.unwrapOr(0);
}

exports.initCredit = async deviceKeyPair => {
  const api = await getApi();
  if (!api) {
    log.error(`Failed to initialise credit of ${deviceKeyPair.address}: Unable to get API`);
    return false;
  }

  const err = await sendTxn(api.tx.credit.initializeCredit(), deviceKeyPair, -1, api);
  if (err) {
    log.error(`Failed to initialise credit of ${deviceKeyPair.address}: ${err}`);
    return false;
  }

  log.info(`Credit of ${deviceKeyPair.address} initialised`);
  return true;
};

/* FOR INTERNAL USE ONLY */
exports.setCredit = async (deviceKeyPair, credit) => {
  const keyring = new Keyring({
    type: 'sr25519',
  });
  const root = keyring.addFromUri(config.ROOT_KEY);

  const api = await getApi();
  if (!api) {
    return;
  }

  const err = await sendTxn(api.tx.sudo.sudo(api.tx.credit.setCredit(deviceKeyPair.address, credit)), root, -1, api);
  if (err) {
    log.error(`Failed to set credit of ${deviceKeyPair.address} to ${credit}: ${err}`);
  }
};

function getSelectedValidators(validators) {
    if (validators && validators.length > 0) {
        let len = validators.length;
        if (len <= config.POC_DELEGATION_MAX_VALIDATORS) {
            return validators;
        } else {
            let startIndex = Math.floor(Math.random() * len);
            let selectValidators = new Array();
            for (var i = startIndex; i < startIndex + config.POC_DELEGATION_MAX_VALIDATORS; i++) {
                selectValidators.push(validators[i % len]);
            }
            return selectValidators;
        }
    } else {
        return new Array();
    }
}

exports.autoDelegate = async function (deviceKeyPair) {
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }

    const validatorsOption = await api.query.delegating.candidateValidators();
    const validators = validatorsOption.unwrapOrDefault();
    if (validators) {
        // check if has been delegated
        const creditDelegateInfo = await api.query.delegating.delegatedToValidators(deviceKeyPair.address);
        if ( creditDelegateInfo && creditDelegateInfo.validators && creditDelegateInfo.validators.length > 0){
            // undelegate
            const err = await sendTxn(api.tx.delegating.undelegate(), deviceKeyPair, -1, api);
            if (err) {
                log.error(`${deviceKeyPair.address} failed to undelegate: ${err}`);
                return false;
            }
            log.info(`${deviceKeyPair.address} undelegate successfully: ${validators}`);
        }

        // delegate
        const selectedValidators = getSelectedValidators(validators);

        const err = await sendTxn(api.tx.delegating.delegate(selectedValidators), deviceKeyPair, -1, api);
        if (err) {
            log.error(`Failed to auto delegate: ${err}`);
            return false;
        }
        return true;
    } else {
        log.error('candidate validators is none');
        return false;
    }
}

exports.getCandidateValidators = async function(){
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }
    const validatorsOption = await api.query.delegating.candidateValidators();
    const validators = validatorsOption.unwrapOrDefault();
    return validators;
}

exports.delegate = async function(validators, deviceKeyPair){
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return false;
    }

    // check if has been delegated
    const creditDelegateInfo = await api.query.delegating.delegatedToValidators(deviceKeyPair.address);
    if (creditDelegateInfo && creditDelegateInfo.validators && creditDelegateInfo.validators.length > 0) {
        // undelegate
        const err = await sendTxn(api.tx.delegating.undelegate(), deviceKeyPair, -1, api);
        if (err) {
            log.error(`${deviceKeyPair.address} failed to undelegate: ${err}`);
            return false;
        }
        log.info(`${deviceKeyPair.address} undelegate successfully: ${validators}`);
    }

    // delegate
    const err = await sendTxn(api.tx.delegating.delegate(validators), deviceKeyPair, -1, api);
    if (err) {
        log.error(`Failed to delegate: ${err}`);
        return false;
    }
    return true;
}

exports.getDelegatedValidators = async function(deviceKeyPair){
    let api = await getApi();
    if (!api) {
        log.error('unable to get api');
        return [];
    }

    const creditDelegateInfo = await api.query.delegating.delegatedToValidators(deviceKeyPair.address);
    if (creditDelegateInfo && creditDelegateInfo.validators && creditDelegateInfo.validators.length > 0){
        return creditDelegateInfo.validators;
    }else{
        return [];
    }
}

function verifyMicropaymentSignature(senderAddr, receiverAddr, nonce, sessionId, amount, signature) {
  let msg = constructMicropaymentPayload(receiverAddr, nonce, sessionId, amount);
  let res = signatureVerify(msg, signature, senderAddr);
  return res.isValid;
}

exports.verifyMicropayment = async function(senderAddr, receiverAddr, nonce, sessionId, amount, signature) {
  if(!senderAddr || !receiverAddr || !signature) {
    log.info(`verifyMicropayment: invalid inputs. sender: ${senderAddr}, receiver: ${receiverAddr}, sig: ${signature}`);
    return false;
  }

  if (!verifyMicropaymentSignature(senderAddr, receiverAddr, nonce, sessionId, amount, signature)) {
    log.info('verifyMicropayment: signature not correct');
    return false;
  }

  let api = await getApi();
  if (!api) {
    log.error('unable to get api');
    return false;
  }
  let channel = await api.query.micropayment.channel([senderAddr, receiverAddr]);
  if (!channel && channel.expiration == 0) {
    log.info('verifyMicropayment: channel not exists or channel expired...');
    return false;
  }
  // check channel expiration
  if (channel.expiration < config.CHANNEL_EXPIRATION_THRESHOLD) {
    log.info(`verifyMicropayment: channel will expire in ${channel.expiration}, less than minimum ${config.CHANNEL_EXPIRATION_THRESHHOLD} blocks`);
    return false;
  }

  return true;
}

exports.claimMicropayment = async function(senderAddr, receiverKeypair, sessionIdNum, amtNum, signature) {
  let api = await getApi();
  if (!api) {
    log.error('unable to get api');
    return false;
  }
  let amt = DPRToAtom(amtNum);
  let sessionId = new BN(sessionIdNum.toString(),10);

  const err = await sendTxn(api.tx.micropayment.claimPayment(senderAddr, sessionId, amt, signature), receiverKeypair, -1, api, false, true, 'claimMicropayment');
  if (err) {
    log.error(`Failed to claim micropayment: ${err}`);
  }
}

exports.closeMicropayment = async function(sendAddress, receiverKeypair) {
  let api = await getApi();
  if (!api) {
    log.error('unable to get api');
    return false;
  }
  const err = await sendTxn(api.tx.micropayment.closeChannel(sendAddress), receiverKeypair, -1, api, false, true, 'closeChannel');
  if (err) {
    log.error(`Failed to close micropayment: ${err}`);
    return false;
  }
  return true;
}

// {"canStaking":true} = permit to delegate credit and staking Token
// {"canStaking":false} = forbid
exports.canStaking = async function() {
    let api = await getApi();
    if (!api) {
      log.error('unable to get api');
      return false;
    }
    const status = await api.query.staking.eraElectionStatus();
    if (status == "Close") {
        return true;
    }else{
        return false;
    }
}

exports.transfer = async (deviceKeyPair, recipient, amount) => {
  const api = await getApi();
  if (!api) {
    return 'Unable to get API';
  }

  amount = DPRToAtom(amount);
  const { nonce } = await api.query.system.account(deviceKeyPair.address);
  log.info(`Transferring ${amount} from ${deviceKeyPair.address} to ${recipient} with nonce ${nonce}`);

  const error = await sendTxn(api.tx.balances.transfer(recipient, amount), deviceKeyPair, nonce, api);
  return error;
};

async function sendTxn(txn, sender, nonce, api, logInBlock, logFinalized, txnType) {
  const error = await new Promise(resolve => {
    sendTxnSafe(txn, sender, nonce, api, logInBlock, logFinalized, txnType, resolve);
  });

  return error;
}

async function sendTxnSafe(txn, sender, nonce, api, logInBlock, logFinalized, txnType, resolve) {
  try {
    const unsub = await txn.signAndSend(sender, {
      nonce
    }, ({ status, events, dispatchError }) => {
      logTxn(status, logInBlock, logFinalized, txnType);

      if (!status.isFinalized) {
        return;
      }

      if (dispatchError) {
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          const { documentation, name, section } = decoded;

          resolve(`${section}.${name}: ${documentation.join(' ')}`);
        } else {
          resolve(dispatchError.toString());
        }
      } else {
        resolve(null);
      }

      unsub();
    });
  } catch (e) {
    resolve(e.toString());
  }
}

function logTxn(status, logInBlock, logFinalized, txnType) {
  if (status.isInBlock && logInBlock) {
    log.info(`${txnType} txn included at blockHash ${status.asInBlock}`);
  } else if (status.isFinalized && logFinalized) {
    log.info(`${txnType} txn finalized at blockHash ${status.asFinalized}`);
  }
}

