import React, {useState} from 'react';
import { Tag,Button } from 'antd';
import { EllipsisOutlined,SearchOutlined } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import {isWeb3Injected, web3Accounts, web3Enable} from "@polkadot/extension-dapp";




let web3data:any = []
let web3address:any = []
async function getWeb3(){
    if (!isWeb3Injected) {
        alert("Please install/unlock the pocket first");
        console.log(isWeb3Injected)
    }
    else {
        await web3Enable('liu')
        const allAccounts = await web3Accounts();

        for (let i=0;i < allAccounts.length;){
            i++
            web3data.push(allAccounts[i-1].meta.name)
            web3address.push(allAccounts[i-1].address)
        }
        console.log(allAccounts);
        // console.log(allAccounts[0].address);
    }
    // console.log(data)
}


function nodata(){
    alert('啥都没有别绑定了！')
}

function getData(){
    console.log('已经绑定地址')
}



const data:any = [
    '暂无',
].map((item) => ({
    subTitle: <Tag color="#5BD8A6">Web3Address:{item}</Tag>,
    actions: [
        <button onClick={nodata} >绑定</button>,
        <a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsubstrate.org.cn%3A4443#/explorer' >查看</a>,
        <a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsubstrate.org.cn%3A4443#/explorer' >
            <EllipsisOutlined />
        </a>,
    ],
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg',
}));


// <Tag color="#5BD8A6">Web3Address:{addressSet}</Tag>
function Pocket () {
    let [Count,setCount] = useState(data)

    function changeContent(){

        getWeb3().then(() => setCount(Count = web3address.map((item:any) => ({
            subTitle:<Tag color="#5BD8A6">Web3Address:{item}</Tag>,
            actions: [
                <button onClick={getData}>绑定</button>,
                <a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsubstrate.org.cn%3A4443#/explorer'  >查看</a>,
                <a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsubstrate.org.cn%3A4443#/explorer'  >
                    <EllipsisOutlined />
                </a>,
            ],
            avatar: 'https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg',
        }))
            ))
        console.log(Count)
        // getWeb3().then(() => console.log(web3data))
    }
        return (
            <ProList<any>
                pagination={{
                    defaultPageSize: 5,
                    showSizeChanger: true,
                }}
                metas={{
                    title: {},
                    subTitle: {},
                    type: {},
                    avatar: {},
                    actions: {},
                }}
                dataSource={Count}
                headerTitle={<Button  onClick={changeContent} style={{marginLeft:'-30px'}} icon={<SearchOutlined />}>获取链上账号</Button>}
            >
            </ProList>
        );
}

export default Pocket


