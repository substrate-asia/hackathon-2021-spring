import path from 'path'
import crypto from 'eth-crypto'

import { stringToU8a, u8aToString, u8aToHex } from '@polkadot/util';
import Keyring from '@polkadot/keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise, CodePromise } from '@polkadot/api-contract';
import fs from 'fs'

import { xxhashAsHex, mnemonicToMiniSecret } from '@polkadot/util-crypto';

import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

import {IPFS} from './index'
import { KeyringPair } from '@polkadot/keyring/types';


class Blockchain {

  signer: KeyringPair
  ipfs: IPFS

  privateKey: string
  publicKey: string
  address: string

  contract_address: string
  cache: low

  constructor(mnemonic, contract_address, ipfs) {
    const keyring = new Keyring({
      type: "sr25519",
      ss58Format: 42
    })

    
    const privateKey = mnemonicToMiniSecret(mnemonic)
    const publicKey = crypto.publicKeyByPrivateKey(u8aToHex(privateKey))
    
    mnemonic = "//Alice"
    const signer = keyring.addFromUri(mnemonic)

    this.contract_address = contract_address
    this.signer = signer
    this.privateKey = u8aToHex(privateKey)
    this.publicKey = publicKey
    this.address = signer.address

    this.cache = low(new FileSync(path.resolve(__dirname  + '/cache.json')))
    this.cache.defaults({
      'vaults': {},
      "latest_vault_id": 0
    }).write()

    this.ipfs = ipfs
  }

  async writeContract(extrinsic) {
    return new Promise((resolve, reject) => {
      extrinsic.signAndSend(this.signer, (result) => {
        console.log(result)
        if (result.status.isInBlock) {
          resolve(result)
        }
      })
    })
  }

  async getContractInstance(){
    const provider = new WsProvider('ws://127.0.0.1:9944')
    const abi = JSON.parse(fs.readFileSync(
      path.resolve(__dirname + '/artifacts/skyepassvault.json'), 'utf-8'))
    const api = await ApiPromise.create({
      rpc: provider,
      types: {
        Address: 'AccountId',
        LookupSource: 'AccountId'
      }
    })
    const contract = new ContractPromise(api, abi, this.contract_address);
    return contract
  }

  async buildVaultsCache() {
    const contract = await this.getContractInstance()
    let latest_vault_id = this.cache.get('latest_vault_id').value()
    while (true) {
      const vault_owner = (await contract.query
        .ownerOf(this.address, { gasLimit: -1 }, latest_vault_id)).output?.toHuman()
      
      console.log('vault id', latest_vault_id)
      console.log('vault owner', vault_owner)
      if (!vault_owner) break
      
      if (vault_owner == this.address) {
        const metadata_cid = (await contract.query
          .getMetadata(this.address, { gasLimit: -1 }, latest_vault_id)).output?.toHuman()
        
        
        const metadata = JSON.parse(await this.ipfs.cat(metadata_cid))
        console.log('metadata', metadata.name, xxhashAsHex(latest_vault_id))

        this.cache.setWith(`vaults["${latest_vault_id}"]`, {
          name: metadata.name,
          nonce: metadata.nonce,
          metadata: metadata_cid,
          display: xxhashAsHex(latest_vault_id)
        }).write()
      }
      latest_vault_id++
    }
    this.cache.setWith(`latest_vault_id`, latest_vault_id).write()
  }

  async getVaults() {
    await this.buildVaultsCache()
    return this.cache.get('vaults').value()
  }

  async createVault(cid) {
    const contract = await this.getContractInstance()
    await this.writeContract(contract.tx
        .createVault({ gasLimit: -1 }, cid))
    await this.buildVaultsCache()
  }
  
  async nominateMember(vault_id, member_address) {
    const contract = await this.getContractInstance()
    await this.writeContract(contract.tx
      .nominateMember({ gasLimit: -1 }, vault_id, member_address))
  }

  async removeMember(vault_id, member_address) {
    const contract = await this.getContractInstance()
    await this.writeContract(contract.tx
      .removeMember({ gasLimit: -1 }, vault_id, member_address))
  }

  async updateMetadata(vault_id, cid) {
    const contract = await this.getContractInstance()
    await this.writeContract(contract.tx
      .updateMetadata({ gasLimit: -1 }, vault_id, cid))
  }

  async burnVault(vault_id) {
    const contract = await this.getContractInstance()
    await this.writeContract(contract.tx
      .burnVault({ gasLimit: -1 }, vault_id))
  }

  async getMetadata(vault_id) {
    const contract = await this.getContractInstance()
    return (await contract.query.getMetadata(this.address, 
      { gasLimit: -1 }, vault_id)).output?.toHuman()
  }

  async authorizeOwner (vault_id) {
    const contract = await this.getContractInstance()
    return (await contract.query.authorizeOwner(this.address,
      { gasLimit: -1 }, vault_id, this.address)).output?.toHuman()
  }
  async authorizeMember(vault_id) {
    const contract = await this.getContractInstance()
    return (await contract.query.authorizeMember(this.address,
      { gasLimit: -1 }, vault_id, this.address)).output?.toHuman()
  }
}

export {Blockchain}
