import React, { FC, ReactElement, useMemo, useState } from 'react';
import { BackTo } from './back';
import { NoAddress } from './no-address';
import './request.css';
import { Send } from './send';
import { useContractTx } from '../../core/hooks/use-contract-tx';
import { useExampleContract } from '../../core/hooks/use-example-contract';
import { useContractQuery } from '../../core/hooks/use-contract-query';
import { useAccount } from '../../core/hooks/use-account';

enum Phase {
  initial = 'initial',
  loading = 'loading',
  success = 'success',
  fail = 'fail',
}

export const Request: FC = (): ReactElement => {
  const [ phase, setPhase ] = useState<Phase>(Phase.initial);
  const [ btcAddress, setBtcAddress ] = useState<string>('');
  const { contract } = useExampleContract();
  const { execute: requestBTCAddress } = useContractTx({ title: 'request btc address', contract, method: 'requestBtcDepositAddress' });
  const { read: getBTCAddress } = useContractQuery({ contract, method: 'getBtcDepositAddress' });
  const { currentAccount } = useAccount();

  useMemo(() => {
    setPhase(Phase.initial);
    setBtcAddress('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount]);
  const handleEnter = async () => {
    setPhase(Phase.loading);
    const noAvailable = 'No Available Address';
    try {
      let btcAddress = await getBTCAddress();
      console.log('get btc', btcAddress)
      if (btcAddress) {
        setPhase(Phase.success);
        return setBtcAddress((btcAddress as any) || noAvailable);
      }
      await requestBTCAddress([]);
      btcAddress = await getBTCAddress();
      console.log('get btc 2', btcAddress)
      setBtcAddress((btcAddress as any) || noAvailable);
      setPhase(Phase.success);
    } catch (e) {
      setPhase(Phase.fail)
    }
  };

  const handleBack = () => {
    setPhase(Phase.initial);
  };

  return (
    <div className="area">
      {
        phase === Phase.initial &&
          <div className="request-button" onClick={handleEnter}>
            Request
          </div>
      }
      {
        phase === Phase.loading &&
          <div className="request-button">
            Requesting...
          </div>
      }
      
      {
        phase === Phase.success &&
          <div>
            <BackTo onBack={handleBack} />
            <Send address={btcAddress} />
          </div>
      }
      {
        phase === Phase.fail &&
          <div>
            <BackTo onBack={handleBack} />
            <NoAddress />
          </div>
      }
    </div>
  );
};