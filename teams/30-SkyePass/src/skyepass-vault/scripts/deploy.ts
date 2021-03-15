import { patract, network } from 'redspot';
import crypto from 'eth-crypto'
import BN from 'bn.js'
const { getContractFactory } = patract;
const { createSigner, keyring, api } = network;

const uri = '//Alice';

async function run() {
  await api.isReady;

  const signer = createSigner(keyring.createFromUri(uri));
  const contractFactory = await getContractFactory('skyepassvault', signer);
  const contract = await contractFactory.deploy('new');
  console.log('');
  console.log(
    'Deploy successfully. The contract address: ',
    contract.address.toString()
  );
  api.disconnect();
}

run().catch((err) => {
  console.log(err);
});
