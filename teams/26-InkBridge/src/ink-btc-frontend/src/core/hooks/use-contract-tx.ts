import { ContractPromise } from '@polkadot/api-contract';
import { web3FromSource } from '@polkadot/extension-dapp';
import { useCallback, useState } from 'react';
import { useAccount } from './use-account';
import { useApi } from './use-api';

export type ContractTxProps = {
  contract: ContractPromise;
  method: string;
  title: string;
};

export const useContractTx = ({ contract, method }: ContractTxProps) => {
  const { api } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const { currentAccount } = useAccount();

  const queryEstimatedWeight = useCallback(
    async (fields: any[], value?: string) => {
      const { gasConsumed, result } = await contract.query[method](currentAccount!.address, { gasLimit: -1, value: value || '0' }, ...fields);
      return result.isOk ? gasConsumed : null;
    },
    [contract, currentAccount, method]
  );

  const execute = useCallback(
    async (fields: any[], value?: string) => {
      if (!currentAccount) {
        throw new Error('No Account');
      }

      setIsLoading(true);

      try {
        const estimatedGas = await queryEstimatedWeight(fields, value);
        const tx = contract.tx[method](
          {
            gasLimit: estimatedGas?.toBn() || '400000000000',
            value: value || 0
          },
          ...fields
        );
        const injector = await web3FromSource(currentAccount.meta.source as any);
        // await tx.signAndSend(currentAccount.address, { signer: injector.signer });
        await new Promise((resolve, reject) => {
          tx.signAndSend(currentAccount.address, { signer: injector.signer }, (result) => {
            console.log('exec result', result);
            if (!result || !result.status) {
              return;
            }
            // txUpdateCb(extractEvents(result));
        
            if (result.status.isFinalized || result.status.isInBlock) {
              result.events
                .filter(({ event: { section } }) => section === 'system')
                .forEach(({ event }): void => {
                  if (event.method === 'ExtrinsicFailed') {
                    console.log('ExtrinsicFailed', event)
                    reject(result);
                  } else if (event.method === 'ExtrinsicSuccess') {
                    resolve(result);
                  }
                });
            } else if (result.isError) {
              reject(result);
            }
        
            if (result.isCompleted) {
              // unsubscribe();
            }
          });
        });
        // await tx.signAndSend(currentAccount.address, { signer: injector.signer });
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        throw error;
      }
    },
    [queryEstimatedWeight, api, contract, method, currentAccount]
  );

  return {
    isLoading,
    execute
  };
};
