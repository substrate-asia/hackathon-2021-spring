import { patract, network } from 'redspot';

const { getContractFactory } = patract;
const { createSigner, keyring, api } = network;

const uri =
  'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice';

async function run() {
  await api.isReady;

  const signer = createSigner(keyring.createFromUri(uri));

  const balance = await api.query.system.account(signer.address);

  console.log('Balance: ', balance.toHuman());

  const sTokenContractFactory = await getContractFactory('erc20', signer);
  const sTokenContract = await sTokenContractFactory.deployed('IErc20,new', '0', 'SToken', 'STO', '10', {
    gasLimit: '200000000000',
    value: '10000000000000000',
  });
  console.log(
    'Deploy sToken successfully. The contract address: ',
    sTokenContract.address.toString()
  );
  console.log('');

  const debtTokenContractFactory = await getContractFactory('erc20', signer);
  const debtTokenContract = await debtTokenContractFactory.deployed('IErc20,new', '0', 'Debt Token', 'DTT', '10', {
    gasLimit: '200000000000',
    value: '10000000000000000',
  });
  console.log(
    'Deploy debtToken successfully. The contract address: ',
    debtTokenContract.address.toString()
  );
  console.log('');

  const contractFactory = await getContractFactory('lendingpool', signer);

  const contract = await contractFactory.deployed('new', sTokenContract.address, debtTokenContract.address, {
    gasLimit: '200000000000',
    value: '10000000000000000',
  });

  console.log('');
  console.log(
    'Deploy lendingpool successfully. The contract address: ',
    contract.address.toString()
  );

  // transfer stoken contract ownership to maker
  await sTokenContract.tx['ownable,transferOwnership'](contract.address.toString());

  // transfer debttoken contract ownership to maker
  await debtTokenContract.tx['ownable,transferOwnership'](contract.address.toString())

  api.disconnect();
}

run().catch((err) => {
  console.log(err);
});
