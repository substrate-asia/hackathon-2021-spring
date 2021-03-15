import { patract, network, artifacts } from 'redspot';
import BN from 'bn.js';
import path from 'path'

import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

const { getContractFactory, getRandomSigner } = patract;
const { api, getSigners } = network;

class Blockchain {

  constructor() {

  }
}

export {Blockchain}
