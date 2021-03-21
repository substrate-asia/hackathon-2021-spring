import steem from 'steem'
import axios from 'axios'
import { STEEM_API_URLS, STEEM_CONF_KEY, STEEM_GAS_ACCOUNT, STEEM_STAKE_FEE, STEEM_MINE_ACCOUNT } from '../../config.js'
import { sleep } from '../helper'

const steemConf = window.localStorage.getItem(STEEM_CONF_KEY) || STEEM_API_URLS[0]
window.localStorage.setItem(STEEM_CONF_KEY, steemConf)
steem.api.setOptions({ url: steemConf })

function requestBroadcastWithFee (account, address, fee, symbol, operation, needsActive = true) {
  const steemGas = STEEM_GAS_ACCOUNT
  const feeOperation = [
    'transfer',
    {
      from: account,
      to: steemGas,
      amount: fee + ' ' + symbol,
      memo: 'fee: ' + operation[0] + ' ' + address
    }
  ]
  return new Promise(resolve => {
    steem_keychain.requestBroadcast(account, [feeOperation, operation],
      needsActive ? 'Active' : 'Posting', function (response) {
        resolve(response)
      })
  })
}

export async function transferSteem (from, to, amount, memo) {
  amount = parseFloat(amount).toFixed(3)
  const transOp = [
    'transfer',
    {
      from,
      to,
      amount: amount + ' STEEM',
      memo
    }
  ]
  return await new Promise(resolve => {
    steem_keychain.requestBroadcast(from, [transOp],
      'Active', function (response) {
        resolve(response)
      })
  })
}

export async function delegate (
  privateKey,
  delegator,
  delegatee,
  vesting_shares,
  address,
  fee
) {
  vesting_shares = parseFloat(vesting_shares).toFixed(6) + ' VESTS'
  return await requestBroadcastWithFee(privateKey, delegator, address, fee, 'STEEM', [
    'delegate_vesting_shares',
    {
      delegator,
      delegatee,
      vesting_shares
    }
  ])
}

export async function steemWrap (from, to, amount, memo, currency, address, fee) {
  fee = parseFloat(fee).toFixed(3)
  return await requestBroadcastWithFee(from, address, fee, currency, [
    'transfer',
    {
      from,
      to,
      amount: amount + ' ' + currency,
      memo
    }
  ])
}

export async function steemDelegation (delegator, delegatee, amount, address) {
  const fee = parseFloat(STEEM_STAKE_FEE || 1).toFixed(3)
  return await requestBroadcastWithFee(delegator, address, fee, 'STEEM', [
    'delegate_vesting_shares',
    {
      delegator,
      delegatee,
      vesting_shares: amount + ' ' + 'VESTS'
    }
  ])
}

export async function steemTransferVest (from, to, amount, address) {
  fee = parseFloat(fee).toFixed(3)
  const steemGas = STEEM_GAS_ACCOUNT
  const transferVestOp = [
    'transfer_to_vesting',
    {
      from,
      to,
      amount: amount + ' STEEM'
    }
  ]
  return await new Promise(resolve => {
    steem_keychain.requestBroadcast(from, [transferVestOp],
      'Active', function (response) {
        resolve(response)
      })
  })
}

export async function getGlobalProperties () {
  return await steem.api.getDynamicGlobalPropertiesAsync()
}

export async function steemToVest (steemPower) {
  const props = await getGlobalProperties()
  const totalSteem = Number(props.total_vesting_fund_steem.split(' ')[0])
  const totalVests = Number(props.total_vesting_shares.split(' ')[0])
  return ((parseFloat(steemPower) * totalVests) / totalSteem).toFixed(6)
}

export async function vestsToSteem (vests) {
  const props = await getGlobalProperties()
  const totalSteem = Number(props.total_vesting_fund_steem.split(' ')[0])
  const totalVests = Number(props.total_vesting_shares.split(' ')[0])
  return ((parseFloat(vests) * totalSteem) / totalVests)
}

export const getAccountInfo = async (account) => {
  const results = await steem.api.getAccountsAsync([account])
  if (results.length === 0) {
    return null
  } else {
    return results[0]
  }
}

export const getSteemBalance = async (username) => {
  const accountInfo = await getAccountInfo(username)
  return parseFloat(accountInfo.balance)
}

export const getSbdBalance = async (username) => {
  const accountInfo = await getAccountInfo(username)
  return parseFloat(accountInfo.sbd_balance)
}

export const getVestingShares = async (username) => {
  const account = await getAccountInfo(username)
  const staked = parseFloat(account.vesting_shares)
  const delegated = parseFloat(account.delegated_vesting_shares)
  return staked - delegated
}

export const getKeychain = async () => {
  if (window.steem_keychain) {
    return window.steem_keychain
  }
  await sleep(2)
  return window.steem_keychain
}

export const updatePnutForVoteParams = async (jsonMetadata) => {
  const op = [
    'account_update2',
    {
      "account":STEEM_MINE_ACCOUNT,
      json_metadata:'',
      "posting_json_metadata":jsonMetadata,
      extensions:[]
    }
  ]
  return await new Promise(resolve => {
    steem_keychain.requestBroadcast(STEEM_MINE_ACCOUNT, [op],
      'Active', function (response) {
        resolve(response)
      })
  })
}

export const getPost = async function (author, permlink) {
  return new Promise(async (resolve, reject) => {
    const read = async (retries = 3) => {
      try {
        const res = await steem.api.getContentAsync(author, permlink);
        if (res && res.author !== "" && res.permlink !== "") {
          resolve(res);
        } else {
          reject(`Post:${permlink} of author:${author} is not exist!`);
        }
      } catch (error) {
        if (retries > 0) {
          setTimeout(async () => {
            await read(retries - 1);
          }, 1000);
        } else {
          console.error("Get Post of author/permlink failed:", error.message);
          reject(error);
        }
      }
    };
    read();
  });
};

export const postHasVotedByNutbox = async function (author, permlink) {
  try{
    const post = await getPost(author, permlink)
    if (post && post.active_votes && post.active_votes.length > 0) {
      return post.active_votes.filter((vote) => {
        return vote.voter === STEEM_MINE_ACCOUNT;
      })[0];
    }else{
      return false;
    }
  }catch(e){
    return false;
  }

};
