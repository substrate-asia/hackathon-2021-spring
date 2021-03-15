import { Abi, ContractPromise } from '@polkadot/api-contract';
import { useCallback } from 'react';
import { useApi } from './use-api';

export const useContractFactory = () => {
  const { api } = useApi();

  return useCallback(
    (address: string, abi: any) => {
      if (!address) {
        throw new Error('Unexpected');
      }

      return {
        contract: new ContractPromise(api, abi, address),
        abi: new Abi(abi),
        abiJSON: abi
      };
    },
    [api]
  );
};
