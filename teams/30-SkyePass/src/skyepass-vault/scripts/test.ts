import { patract, network } from 'redspot';

const { getContractFactory, getContractAt } = patract;
const { createSigner, keyring, api } = network;
import { stringToU8a } from '@polkadot/util';
import { xxhashAsHex } from '@polkadot/util-crypto';
import type { Bytes } from '@polkadot/types';

const uri = '//Alice';

async function run() {

  await api.isReady
  const signer = createSigner(keyring.createFromUri(uri));
  // const contractFactory = await getContractFactory('skyepassvault', signer);
  // const contract = await contractFactory.deploy('new');

  await api.query.system.events(events => {
    console.log(`\nReceived ${events.length} events:`);

    // Loop through the Vec<EventRecord>
    events.forEach((record) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      if (event.section == 'contracts' && event.method == 'ContractExecution') {
        const [accountId, encoded] = event.data
        const decoded = contract.abi.decodeEvent(encoded as Bytes)
        console.log(decoded.event)
        console.log(decoded.args.toString())

        // event.data.forEach((data, index) => {
        //   console.log(contract.abi.decodeEvent(data))
        // })
      }
      // Loop through each of the parameters, displaying the type and data
      // event.data.forEach((data, index) => {
      //   console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
      // });
    });
  })

  const contract = await getContractAt('skyepassvault', 
    '5HmpbAGMzSW6jbH84YnjXcpQ2B7mJfeLpSYEZ87DrwCXojpm', 
    signer)
  
  await contract.tx.createVault('hello')
  await contract.tx.createVault('hello')
  await contract.tx.createVault('hello')
  await contract.tx.createVault('hello')
  await contract.tx.createVault('hello')

  // console.log(result)

  // console.log('');
  // console.log(
  //   'Deploy successfully. The contract address: ',
  //   contract.address.toString()
  // );

  // await contract.tx.()



  api.disconnect();
}

run().catch((err) => {
  console.log(err);
});
