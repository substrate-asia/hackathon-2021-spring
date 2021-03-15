import { useContractQuery } from './use-contract-query';
import { useState, useEffect } from 'react';
import { useWBTCContract } from './use-wbtc-contract';
import { useAccount } from './use-account';

export const useBalance = (signal: number): { balance: number } => {
  const [ balance, setBalance ] = useState<number>(0);
  const { contract } = useWBTCContract();
  const { currentAccount } = useAccount();
  const { read } = useContractQuery({ contract, method: 'iErc20,balanceOf' });

  useEffect(() => {
    console.log('read balance')
    read(currentAccount?.address).then(b => {
      setBalance((b as any) || 0);
    });
  }, [signal, currentAccount, read]);

  return { balance };
};