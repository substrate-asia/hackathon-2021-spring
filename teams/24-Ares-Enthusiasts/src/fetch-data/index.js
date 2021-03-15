const { ApiPromise, Keyring, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady }  = require('@polkadot/util-crypto');
const { hexToBn, u8aToBuffer, bufferToU8a } = require('@polkadot/util')

const PHRASE = 'entire material egg meadow latin bargain dutch coral blood melt acoustic thought';

async function fundAggregatorAccountIfNeeded(api, aliceAccount, aggregatorAccount) {
  return new Promise(async (resolve) => {

    let { data: { free: previousFree }, nonce: previousNonce } = await api.query.system.account(aggregatorAccount.address);

    if (previousFree.isZero()) {
        await api.tx.balances.transfer(aggregatorAccount.address, 1000000000000000).signAndSend(aliceAccount, async ({ status }) => {
          if (status.isFinalized) {
            resolve();
          }
        });
        console.log('Operator funded');
    } else {
      resolve();
    }
  });
}

async function registerAggregatorIfNeeded(api, aggregatorAccount) {
  // Register the aggregator, this is supposed to be initiated once by the aggregator itself
  return new Promise(async (resolve) => {
    const operator = await api.query.aresModule.aggregators(aggregatorAccount.address);
      console.log('Operator register'," ",operator.toJSON()," ",aggregatorAccount.address);
      if (operator.toJSON().block_number === 0) {
          await api.tx.aresModule.registerAggregator('ok,huobi','jack', 'http://141.164.45.97:8080/ares/api').signAndSend(aggregatorAccount, async ({ status }) => {
            console.log('Operator registered',status.isFinalized);
            if (status.isFinalized) {
            console.log('Operator registered');
            resolve();
          }
        });
    } else {
      resolve();
    }
  });
}

function sentRes(url,data,method,fn){
  data=data||null;
  if(data==null){
      var content=require('querystring').stringify(data);
  }else{
      var content = JSON.stringify(data); //json format
  }

  var parse_u=require('url').parse(url,true);
  var isHttp=parse_u.protocol=='http:';
  var options={
      host:parse_u.hostname,
      port:parse_u.port||(isHttp?80:443),
      path:parse_u.path,
      method:method,
      headers:{
          'Content-Type':'application/json',
          'Content-Length':Buffer.byteLength(content,"utf8"),
          'Tracking-Api-Key':'YOUR API KEY'
      }
  };
  var req = require(isHttp?'http':'https').request(options,function(res){
      var _data='';
      res.on('data', function(chunk){
          _data += chunk;
      });
      res.on('end', function(){
          fn!=undefined && fn(_data);
      });
  });
  req.write(content);
  req.end();
}

async function main() {
    await cryptoWaitReady();

    // Connect to the local chain
    const wsProvider = new HttpProvider('http://testnet.aresprotocol.com');
    const api = await ApiPromise.create({
        provider: wsProvider,
        types: {
            "TokenSpec": "Vec<u8>",
            "Aggregator": {
                "account_id": "AccountId",
                "block_number": "BlockNumber",
                "source": "Vec<u8>",
                "alias": "Vec<u8>",
                "url": "Vec<u8>"
            },
            "Request": {
                "aggregator_id": "AccountId",
                "block_number": "BlockNumber",
                "token": "Vec<u8>",
                "work_id": "Hash"
            },
            "AggregateResult": {
                "block_number": "BlockNumber",
                "price": "u64"
            }
        }
    });

    const Bytes2HexString =(arr)=> {
        for(j = 0; j < arr.length; j++) {
        if(arr[j].indexOf("TokenSpec")>-1)
        {
          var str=arr[j].split(":")[1].trim()

          var curCharCode;
        　　var resultStr = [];

        　　for(var i = 2; i < str.length;i = i + 2) {
        　　　　curCharCode = parseInt(str.substr(i, 2), 16); // ASCII Code Value
        　　　　resultStr.push(String.fromCharCode(curCharCode));
        　　}
        　　return resultStr.join("");

        }
      }
      return "error";
    }

    // Add an account, straight from mnemonic
    const keyring = new Keyring({ type: 'sr25519' });
    const aggregatorAccount = keyring.addFromUri(PHRASE);
    console.log(`Imported aggregator with address ${aggregatorAccount.address}`);

    // Make sure this aggregator has some funds
    const aliceAccount = keyring.addFromUri('//Alice');
    console.log(`alice ${aliceAccount.address}`);

    await fundAggregatorAccountIfNeeded(api, aliceAccount, aggregatorAccount);

    const result = await api.query.aresModule.oracleResults("btcusdt");

    // Listen for ares.OracleRequest events
    api.query.system.events((events) => {
        events.forEach(record => {
          // extract the phase, event and the event types
          const { event, phase} = record;
          const types = event.typeDef;

          // show what we are busy with
          const eventName = `${event.section}:${
            event.method
          }:: (phase=${phase.toString()})`;

          if (event.section == "aresModule" && event.method == "OracleRequest") {
              // loop through each of the parameters, displaying the type and data
              const params = event.data.map(
                (data, index) => `${types[index].type}: ${data.toString()}`
              );
              console.log(`${params}`);
              //console.log(eventName);

              const id = event.data[2].toString();
              console.log(id);
              var postData = null;
              var SpecIndex = Bytes2HexString(params)
              //get aggregator url and loading
              //var url =`http://141.164.45.97:8080/ares/api/getPartyPrice/${SpecIndex}/${id}`;
              var url =`http://141.164.45.97:8080/ares/api/getPartyPrice/${SpecIndex}`;
              sentRes(url,postData,"GET",function(data) {
                var price=JSON.parse(data).data.price * 1000;
                const result = api.createType('i128', price).toHex();
                // Respond to the request with a dummy result
                api.tx.aresModule.feedResult(parseInt(id), result).signAndSend(aggregatorAccount, async ({ events = [], status }) => {
                    if (status.isFinalized) {
                        const updatedResult = await api.query.aresModule.oracleResults(SpecIndex);
                        console.log(`${SpecIndex} price is now ${updatedResult[updatedResult.length -1]/1000}`);
                    }
                  });
                  console.log(data);
               });
          }
        
      });
    });

    await registerAggregatorIfNeeded(api, aggregatorAccount);

    // Then simulate a call from alice
    await api.tx.aresModule.initiateRequest(aggregatorAccount.address, "btcusdt", "1").signAndSend(aliceAccount);
    console.log(`Alice send a request`);
}

main().catch(console.error)
