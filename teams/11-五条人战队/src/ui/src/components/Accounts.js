import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { useSubstrate, useAccounts } from '../substrate-lib';



function Accounts(props) {
    const { keyring, api, apiState } = useSubstrate();
    const { account, setAccount } = useAccounts();

    const [accountList, setAccountList] = useState([]);
    const [dropState, setDropState] = useState(false);
    const [accountBalance, setAccountBalance] = useState(0);

    // 初始化账号 list
    useEffect(() => {
        if (keyring) {
            setAccountList(keyring.getPairs());
        }
    }, [keyring]);

    // 初始化账号 alice
    useEffect(() => {
       if (!account && accountList.length>0) {
            setAccount(accountList[0]);
       }
    }, [accountList, account, setAccount]);

    // 查询账户余额
    useEffect(() => {
        let unsubscribe = null;
        account && apiState === 'READY' && 
            api.query.system.account(account.address, balance => {
                setAccountBalance(balance.data.free.toHuman());
            })
            .then(unsub => {
                unsubscribe = unsub;
            })
            .catch(console.error);

        return () => unsubscribe && unsubscribe();
    }, [api, apiState, account]);

    return <div className={props.className} onClick={() => setDropState(!dropState)}>
        <span>{account && account.meta.name.toUpperCase()}</span>
        <span className="balance">{accountBalance}</span>
        <div className={"drop-list " + (dropState ? '' : 'hide')}>
            {
                accountList.map(acc => <div
                    onClick={() => setAccount(acc)}
                    key={acc.address} 
                    className="account-item">
                    <b>{acc.meta.name}</b>
                </div>)
            }
        </div>
    </div>
}

export default React.memo(styled(Accounts)`
    position: relative;
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    border: 1px solid #999;
    border-radius: 5px;
    min-width: 50px;
    text-align: center;

    .balance {
        padding: 0 5px;
        font-size: 12px;
        color: #666;
    }

    .drop-list {
        position: absolute;
        right: 0;
        top: 30px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        white-space: nowrap;
        background: #fff;
        box-shadow: 0 0 3px;
        border-radius: 5px;

        .account-item {
            display: inline-flex;
            height: 35px;
            line-height: 35px;
            text-align: center;

            &:hover{
                cursor: pointer;
                background-color:#eee;
            }
            

            &.active {
                background-color: #ccc;
            }
        }
    }

    .hide {
        display: none;
    }
`);