import { patract, network } from 'redspot';

const { getContractFactory } = patract;
const { createSigner, keyring, api } = network;

const uri =
  'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice';

async function run() {
  await api.isReady;

  const signer = createSigner(keyring.createFromUri(uri));
  const contractFactory = await getContractFactory('btc_bridge', signer);

  const balance = await api.query.system.account(signer.address);

  console.log('Balance: ', balance.toHuman());

  let btcHeader = { version: '536870914', previous_header_hash: '0x6934fca9a5dd15210ad36fd1898d6c0ac300dba0aa0148000000000000000000',
   merkle_root_hash: '0x00723257646dddf1d79467b83425b0498d4c3b4ec8cf12fff20853b67fc3f6b2', time: '1501593084', bits: '402736949', nonce: '2052134201' };

  let btcHeaderInfo = { header: btcHeader, height: '478557' };

  const contract = await contractFactory.deployed('new', btcHeaderInfo, 1, {
    gasLimit: '200000000000',
    value: '10000000000000000',
  });

  console.log('');
  console.log(
    'Deploy ink bridge successfully. The contract address: ',
    contract.address.toString()
  );
  console.log('');

  const wbtcContractFactory = await getContractFactory('erc20_issue', signer);
  const wbtcContract = await wbtcContractFactory.deployed('IErc20,new', '0', 'Wrapped Bitcoin', 'WBTC', '8', {
    gasLimit: '200000000000',
    value: '10000000000000000',
  });
  console.log(
    'Deploy wbtc successfully. The contract address: ',
    wbtcContract.address.toString()
  );
  console.log('');

  const exampleFactory = await getContractFactory('bridge_example', signer);
  const exampleContract = await exampleFactory.deployed('new', contract.address, wbtcContract.address, {
    gasLimit: '200000000000',
    value: '10000000000000000',
  });
  console.log('');
  console.log(
    'Deploy bridge example successfully. The contract address: ',
    exampleContract.address.toString()
  );

  // transfer dai contract ownership to maker
  await wbtcContract.tx['ownable,transferOwnership'](exampleContract.address.toString())

  api.disconnect();
}

run().catch((err) => {
  console.log(err);
});
