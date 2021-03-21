import { getTronLink, getTron, getTronLinkAddr, amountToInt, isTransactionSuccess, isInsufficientEnerge } from './tron.js'
import axios from 'axios'
import { APPROVE_TOKEN_CONTRACT_PAIR, TRC20_APPROVE_AMOUNT, TRON_LINK_ADDR_NOT_FOUND } from '../../config'
import store from '../../store'

const CONTRACT_JSON_NAME_LIST = {
  PNUT: 'NutboxPeanuts.json',
  TSBD: 'NutboxSbd.json',
  TSTEEM: 'NutboxSteem.json',
  TSP: 'NutboxTsp.json',
  PNUT_POOL: 'PeanutsPoolV2.json',
  TSP_LP_POOL: 'TspLpPool.json',
  TSP_POOL: 'TspPooling.json',
  PNUT_LP_POOL: 'PnutLpPool.json',
}

export const getAbiAndContractAddress = async function (symbol) {
  symbol = symbol.toUpperCase()
  const tronweb = getTron()
  const res = await axios.get('/' + CONTRACT_JSON_NAME_LIST[symbol])
  const abi = res.data.abi
  const address = tronweb.address.fromHex(res.data.networks['*'].address)
  return { abi, address }
}

export const getContract = async function (symbol) {
  symbol = symbol.toUpperCase()
  let instance = store.state.contracts[symbol]
  if (Object.keys(instance).length !== 0) {
    return instance
  }
  const tronLink = await getTronLink()
  if (!tronLink) return
  const { abi, address } = await getAbiAndContractAddress(symbol)
  instance = tronLink.contract(abi, address)
  store.commit('save'+symbol+'Contract', instance)
  return instance
}

export const approveContract = async function (symbol) {
  symbol = symbol.toUpperCase()
  const token = APPROVE_TOKEN_CONTRACT_PAIR[symbol][0]
  const pool = APPROVE_TOKEN_CONTRACT_PAIR[symbol][1]
  try {
    const user = await getTronLinkAddr()
    if (user === TRON_LINK_ADDR_NOT_FOUND.noTronLink || user === TRON_LINK_ADDR_NOT_FOUND.walletLocked) return 1;
    const approveInt = amountToInt(TRC20_APPROVE_AMOUNT)
    const tronLink = await getTronLink()
    const params = [
      { type: 'address', value: pool },
      { type: 'uint256', value: approveInt }
    ]
    const { result, transaction } = await tronLink.transactionBuilder.triggerSmartContract(
      token,
      'approve(address,uint256)',
      { feeLimit: 20_000_000 },
      params,
      user
    )

    if (result && result.result !== true) {
      return 1
    }

    const signedTx = await tronLink.trx.sign(transaction)

    const { txid } = await tronLink.trx.sendRawTransaction(signedTx)

    if (txid && (await isTransactionSuccess(txid))) {
      return 0
    } else {
      if (txid && (await isInsufficientEnerge(txid))) {
        return 2
      } else {
        return 1
      }
    }
  } catch (err) {
    console.error(err);
    return 1
  }
}