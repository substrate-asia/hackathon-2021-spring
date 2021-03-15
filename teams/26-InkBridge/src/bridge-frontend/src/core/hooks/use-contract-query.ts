import { ContractPromise } from '@polkadot/api-contract';
import { useCallback } from 'react';
import { useAccount } from './use-account';

export type ContractQueryProps = {
  contract: ContractPromise;
  method: string;
};

export const contractQuery = async (
  currentAccount: string,
  contract: ContractPromise,
  method: string,
  ...fields: any[]
) => {
  const data = await contract.query[method](currentAccount, {}, ...fields);

  if (data.output?.isEmpty) {
    return null;
  }

  return data.output?.toJSON();
};

export const useContractQuery = ({ contract, method }: ContractQueryProps) => {
  const { currentAccount } = useAccount();

  const read = useCallback(
    async (...fields: any[]) => {
      return contractQuery(currentAccount, contract, method, ...fields);
    },
    [currentAccount, contract, method]
  );

  return {
    read
  };
};
