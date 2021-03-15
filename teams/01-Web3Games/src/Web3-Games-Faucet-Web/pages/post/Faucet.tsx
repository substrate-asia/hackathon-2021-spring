import FaucetCss from '../../styles/Faucet.module.css'
import { Input} from 'antd';
import { Keyring } from '@polkadot/keyring';
import Router from 'next/router'

//导出并强制类型转换
import data from  '../../key/test_exported_account_1614274762546.json'
import {KeyringPair$Json} from "@polkadot/keyring/types";
const Key:KeyringPair$Json = data as unknown as KeyringPair$Json;
import axios from "axios";




const { ApiPromise, WsProvider } = require('@polkadot/api');


//测试是否畅通
async function test (value:string) {
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('wss://substrate.org.cn:4443');

    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider,
        types: {
            Address: 'MultiAddress',
            LookupSource: 'MultiAddress',
            TokenId: 'u64',
            InstanceId: 'u64',
            ExchangeId: 'u32',
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
                    Token: 'TokenSymbol'
                }
            },
            CurrencyIdOf: 'CurrencyId',
            CollectionId: 'u64',
            AssetId: '64'
        }
    });

    // Retrieve the chain & node information information via rpc calls
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);
    await send(value);
    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
}

//转入指定地址账户
async function send (Accepted:string) {
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('wss://substrate.org.cn:4443');

    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider ,types: {
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
        }
    });

    // Constuct the keying after the API (crypto has an async init)
    const keyring = new Keyring({ type: 'sr25519' });

    // Add Alice to our keyring with a hard-deived path (empty phrase, so uses dev)
    const admin = keyring.createFromJson(Key);
    admin.unlock("LIUHONGQI321");
    // Create a extrinsic, transferring 100SGC  to Bob
    const transfer = api.tx.balances.transfer(Accepted, 100000000000000000000n);
    // Sign and send the transaction using our account
    const hash = await transfer.signAndSend(admin);
    console.log('Transfer sent with hash', hash.toHex());
}


const waitTime = (value:any,time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let data = {
                "address":value
            }
            axios({
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post',
                // url: "http://localhost:3030/daily-reward",
                url: "http://sdk.substrate.org.cn:3030/daily-reward",
                data: JSON.stringify(data)
            })
                .then(async function (response) {
                    await test(value)
                        .then(
                            function (){
                                Router.push('/post/Success');
                            }
                        )
                        .catch(
                        function (){
                            Router.push('/post/Error');
                        });
                })
                .catch(function () {
                    Router.push('/post/Error').then()
                });
                resolve(true);
        }, time);

    });
};

// async function address(value:string){
//     let data = {
//         "address":value
//     }
//     axios({
//         headers: {
//             'authorization':'Bearer admin',
//             'Content-Type': 'application/json'
//         },
//         method: 'post',
//         url: "http://sdk.substrate.org.cn:3031/daily-reward",
//         data: JSON.stringify(data)
//     })
//         .then(function (response) {
//             // test(value).catch(console.error);
//             // return response.status
//         })
//         .catch(function () {
//             Router.push('/post/Error').then()
//         });
// }

function Faucet() {
    const { Search } = Input;
    //先检测是否存在地址不存在则3秒去插地址
    function onSearch(value:string){
        if (value.length === 48){
            axios({
                method: 'get',
                // url: `http://localhost:3030/daily-reward/${value}`
                url: `http://sdk.substrate.org.cn:3030/daily-reward/${value}`
            })
                .then(async function (response) {
                    if(response.status === 200){
                        await waitTime(value,100)
                    }
                })
                .catch(async function (error) {
                    await Router.push('/post/Waring');
                    console.log(error);
                });
        }
        else {
            alert("please input right address")
        }
    }

    return (
        <div>
            <div className={FaucetCss.title}>Sgc Testnet Faucet</div>
            <Search className={FaucetCss.input}
                placeholder="input your Polkadot js address "
                allowClear
                enterButton="Give me SGC"
                size="large"
                onSearch={onSearch}
            />
            <div className={FaucetCss.bottom}>Type you Address and get 100 SGC test tokens per day.</div>
            <footer className={FaucetCss.footer}>
                <a
                    href="https://github.com/Web3-Substrate-Game-World"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <img src="/images/logo.svg" alt="SGC Logo" className={FaucetCss.logo} />
                </a>
            </footer>
        </div>
    )

}

export default Faucet
