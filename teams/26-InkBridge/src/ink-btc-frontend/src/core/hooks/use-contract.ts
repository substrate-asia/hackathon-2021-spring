import { useMemo } from 'react';
import { useContractFactory } from './use-contract-factory';

export const useContract = (address: string, abi: any) => {
  const attach = useContractFactory();

  return useMemo(() => {
    return attach(address, abi);
  }, [address, abi, attach]);
};
