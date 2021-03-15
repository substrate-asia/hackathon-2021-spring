import { ApiPromise, WsProvider } from '@polkadot/api';


const sender = '5Dtp6pqcX71gRny3GwUhXKzKYEydbdJt9745qqsDBRh8ToBu'


async function  connect() {
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

    // const result = api.query.erc1155.balances(sender,(1))
    console.log(sender);
    const [balances] = await Promise.all([
        api.query.erc1155.balances(sender,[1,1])
      ]);
    return `${balances}`
    // const info = result.then(value =>{ return value.toString})
    // console.log(info);
};

export {connect}