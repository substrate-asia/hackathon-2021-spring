import { ApiPromise, WsProvider } from '@polkadot/api';
import { createType } from '@polkadot/types';
import {web3Enable,web3FromAddress} from "@polkadot/extension-dapp";
import {MyEvent} from "../event"

const from = "5Dtp6pqcX71gRny3GwUhXKzKYEydbdJt9745qqsDBRh8ToBu"
const to =  "5EqWkr9DYbDNznp2J6GcnFV6g5zWoij9y2rnwFywfpnHDY96"
const InstanceId = 1
const TokenId = 1


async function  transaction() {
    await web3Enable('liu')
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('ws://127.0.0.1:9944');
    // Create the API and wait until ready
    const api = await ApiPromise.create({
        types: {
            Address: "MultiAddress",
            LookupSource: "MultiAddress",
            TokenId: "u64",
            InstanceId: "u64",
            ExchangeId: "u32",
            TokenSymbol: {
                _enum: {
                SGC: 0,
                DOT: 1,
                ACA: 2,
                AUSD: 3
                }
            },
            CurrencyId: {
              _enum: {
                Token: "TokenSymbol"
              }
            },
            CurrencyIdOf: "CurrencyId",
            CollectionId: "u64",
            AssetId: "64"
        },provider}) 
    const AMOUNT = createType(api.registry, 'Balance', '1000000000000000000 ');  
    const injector = await web3FromAddress(from);

    api.tx.erc1155
    .transferFrom(from,to,InstanceId,TokenId,AMOUNT)
    .signAndSend(from,{ signer: injector.signer }, ({ events = [], status }) => {
      console.log('Transaction status:', status.type);
      if (status.isInBlock) {
        cc.director.emit(MyEvent.ADD_SHELL,1);
        console.log('Included at block hash', status.asInBlock.toHex());
      } else if (status.isFinalized) {
        console.log('Finalized block hash', status.asFinalized.toHex());
      }
    }); 
}

export {transaction}