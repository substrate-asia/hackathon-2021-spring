import { ApiPromise, WsProvider } from '@polkadot/api';
import { createType } from '@polkadot/types';
import {MyEvent} from "../event"
import { Keyring } from '@polkadot/keyring';
import * as data from  'metadata/test1_exported_account_1615184681078.json'
import {KeyringPair$Json} from "@polkadot/keyring/types";
const Key:KeyringPair$Json = data as unknown as KeyringPair$Json;

const from = "5EqWkr9DYbDNznp2J6GcnFV6g5zWoij9y2rnwFywfpnHDY96"
const to =  "5Dtp6pqcX71gRny3GwUhXKzKYEydbdJt9745qqsDBRh8ToBu"
const InstanceId = 1
const TokenId = 1
const keyring = new Keyring({ type: 'sr25519' });
const admin = keyring.createFromJson(Key);

async function  returnbalance() {
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
    admin.unlock("LIUHONGQI321");    
    api.tx.erc1155
    .transferFrom(from,to,InstanceId,TokenId,AMOUNT)
    .signAndSend(admin,({status }) => {
      console.log('Transaction status:', status.type);
      if (status.isInBlock) {
        console.log('Included at block hash', status.asInBlock.toHex());
      } else if (status.isFinalized) {
        cc.director.emit(MyEvent.DEL_SHELL);
        console.log('Finalized block hash', status.asFinalized.toHex());
      }
    }); 
}

export {returnbalance}