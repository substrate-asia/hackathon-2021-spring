import React, { FC, ReactElement, useEffect, useState } from 'react';
import { useBalance } from '../../core/hooks/use-balance';
import './action.css';
import { Request } from './request';
import { Verify } from './verify';
import { TabBgBlack } from './tab-bg-black';
import { TabBg } from './tab-bg';
import { useContractQuery } from '../../core/hooks/use-contract-query';
import { useWBTCContract } from '../../core/hooks/use-wbtc-contract';

enum TabChoosed {
  request = 'request',
  verify = 'verify',
}

export const Action: FC = (): ReactElement => {
  const [ tab, setTab ] = useState<TabChoosed>(TabChoosed.request);
  const [ signal, setSignal ] = useState<number>(0);
  const { balance } = useBalance(signal);
  const { contract } = useWBTCContract();
  const [ decimals, setDecimals ] = useState<number>(8);
  const { read: readDecimals } = useContractQuery({ contract, method: 'iErc20,tokenDecimals' });

  const handleVerified = () => {
    setSignal(signal + 1);
  };

  useEffect(() => {
    readDecimals().then(_decimals => setDecimals((_decimals as any) || 8));
  }, [readDecimals]);

  return (
    <div className="action">
      <div className="tabs">
        <div
          onClick={ () => setTab(TabChoosed.request) }
          className="tab-title">
            {
              tab === TabChoosed.request ? <TabBg /> : <TabBgBlack/>
            }
            <div className="tab-text">
              Request Address
            </div>
           {/* style={{ background: tab === TabChoosed.request ? '#F7931A' : '#535353' }}> */}
        </div>
        <div
          onClick={ () => setTab(TabChoosed.verify) }
          className="tab-title tab-verify">
            {
              tab === TabChoosed.verify ? <TabBg rotate={true}/> : <TabBgBlack rotate={true}/>
            }
            <div className="tab-text">
              Verify
            </div>
          {/* style={{ background: tab === TabChoosed.verify ? '#F7931A' : '#535353' }}> */}
        </div>
      </div>
      <div className="action-container">
        {
          tab === TabChoosed.request ?
            <Request />
            :
            <Verify onVerified={ handleVerified }/>
        }
        <div className="balance-area">
          <span className="balance-title">inkBTC balance</span>
          <div className="balance">
            <span>{ balance / (Math.pow(10, decimals)) }</span>
          </div>
        </div>
      </div>
    </div>
  );
};