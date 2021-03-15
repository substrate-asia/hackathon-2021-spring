import { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import { get, noop, isEmpty } from 'lodash';

import { ITuple } from '@polkadot/types/types';
import { EventRecord, ExtrinsicStatus, DispatchError } from '@polkadot/types/interfaces';
import { PatraPixel, DebtToken, SToken, LendingPool } from '@/utils/contracts';
import Pixel from '@/utils/contracts/patrapixel.json'
import Erc20Abi from '@/utils/contracts/erc20.json'
import LendingPoolAbi from '@/utils/contracts/lendingpool.json'
import store from 'store';

import { ExtensionContext, ExtensionData } from '@/components/Provider/ExtensionProvider';
import { ApiContext, ApiContextData } from '@/components/Provider/ApiProvider';

import { balanceFormatter } from '@/utils'

import { CurrencyId, OrmlAccountData } from '@/hooks/types'
import { notification } from 'antd';


export const useAccounts = (): ExtensionData => {
  const data = useContext(ExtensionContext);

  return data;
};

interface Options {
  onSuccess?: () => void;
  onError?: () => void;
}

/**
 * @name useIsAppReady
 * @description check app status, return true when chain connected and has active account, in ohter case return false.
 */
export const useIsAppReady = (options?: Options): boolean => {
  const [appReadyStatus, setAppReadyStatus] = useState<boolean>(false);
  const { api } = useApi();
  const { active: activeAccount } = useAccounts();

  useEffect(() => {
    const accountStatus = (!!activeAccount && !!activeAccount.address);

    const status = accountStatus && !isEmpty(api);

    // handle onSuccess or onError callback
    (status ? get(options, 'onSuccess', noop) : get(options, 'onError', noop))();

    if (status !== appReadyStatus) {
      setAppReadyStatus(status);
    }
  /* eslint-disable-next-line */
  }, [ activeAccount, api, options]);

  return appReadyStatus;
};


export const useBalance = () => {
  const { api } = useApi();
  const {active} = useAccounts();
  const [balance, setBalance] = useState<number | undefined>();

  useEffect(() => {
    const account = active?.address as string
    
    api.query.system.account(account, (info) => {
        const free = balanceFormatter(info.data.free.toString(),10)
        setBalance(free.num);
        console.log(free);        
      })
      .catch(() => {
        setBalance(undefined);
      });
  }, [api, active?.address]);

  return balance;
};

/**
 * @name useApi
 * @description get api context value
 */
export const useApi = (): ApiContextData => {
  return useContext<ApiContextData>(ApiContext);
};

export const useCurrencyBalance = (currency: CurrencyId): string => {
  const { api } = useApi();
  const {active} = useAccounts();
  const [balance, setBalance] = useState<string>(store.get(`Sublend${currency.asToken.toString()}Balance`) || '');

  useEffect(() => {
    if (active) {
      const dm = currency.asToken.toString() === 'BUSD' ? 9 : 10
      api.query.tokens.accounts<OrmlAccountData>(active.address, currency).then(({ free }) => {
        const _free = balanceFormatter(free.toString(), dm).string
        store.set(`Sublend${currency.asToken.toString()}Balance`, _free)
        setBalance(_free);
      })
    }

  }, [api.query.tokens.accounts, active, currency, api.query.tokens])

  return balance

}

// make sure the version of @polkadot/api-contract same as @polkadot-api
export const useContractFactory = () => {
  const { api } = useApi();

  return useCallback(
    (address: string, abi: any) => {
      if (!address) {
        throw new Error(`Unexpected contract address: ${address}`);
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

export const useContract = (address: string, abi: any) => {
  const attach = useContractFactory();

  return useMemo(() => {
    return attach(address, abi);
  }, [attach, address, abi]);
};

export const usePixelContract = () => {
  return useContract(PatraPixel, Pixel);
};

export const useDebtTokenContract = () => {
  return useContract(DebtToken, Erc20Abi);
};

export const useSTokenContract = () => {
  return useContract(SToken, Erc20Abi);
};

export const useLendingPoolContract = () => {
  return useContract(LendingPool, LendingPoolAbi);
};

export type ContractTxProps = {
  contract: ContractPromise;
  method: string;
};

export const useContractTX = ({ contract, method }: ContractTxProps) => {
  const { api } = useApi();
  const {active} = useAccounts();
  const getGascomsumed = useCallback(
    async (fields: any[], value?: string) => {
      return contract.query[method](active?.address as string, { gasLimit: -1, value: value || '0' }, ...fields).then(
        ({ gasConsumed, result }) => {
          return result.isOk ? gasConsumed : null;
        }
      );
    },
    [contract, active, method]
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [inTransaction, setInTransaction] = useState<boolean>(false);
  const exec = useCallback(
    async (fields: any[], value: string, onSuccess?:()=>void, onFail?:()=>void) => {
      if (active) {

        const gasConsumed = await getGascomsumed(fields, value)

        const tx = contract.tx[method](
          {
            gasLimit: gasConsumed?.toBn() || '100000000000',
            value: value || 0
          },
          ...fields
        );
        tx.signAndSend(active?.address, ({ events = [], status }: { events?: EventRecord[], status: ExtrinsicStatus; }) => {
          
          if (status.isInvalid) {
            console.log('Transaction invalid');
            notification.error({
              message: 'Transaction invalid'
            });
            onFail && onFail()
            setInTransaction(false);
          } else if (status.isReady) {
            console.log('Transaction is ready');
            notification.open({
              message: 'Transaction ready',
              duration: null,
              key: 'transaction-ready'
            });
          } else if (status.isBroadcast) {
            console.log('Transaction has been broadcasted');
          } else if (status.isInBlock) {
            console.log('Transaction is in block');
            notification.info({
              message: 'Transaction is in block'
            })
          } else if (status.isFinalized) {
            notification.close('transaction-ready')
            console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
            events.forEach(
              ({ event }) => {
                if (event.method === 'ExtrinsicSuccess') {
                  console.log('Transaction succeeded', event);
                  notification.success({
                    message: 'Transaction succeeded'
                  });
                  onSuccess && onSuccess()
                } else if (event.method === 'ExtrinsicFailed') {
                  const data = event.get('data')
                  const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
                  let message = dispatchError.type;

                  if (dispatchError.isModule) {
                    try {
                      const mod = dispatchError.asModule;
                      const error = api.registry.findMetaError(new Uint8Array([mod.index.toNumber(), mod.error.toNumber()]));
                      const { documentation, name, section } = error;

                      message = `${section}.${name}: ${documentation.join(' ')}`;
                      message = `${error.section}.${error.name}`;
                    } catch (error) {
                      message = Reflect.has(error, 'toString') ? error.toString() : error;
                    }
                  }
                  console.log('Transaction failed', message);

                  onFail && onFail()

                  notification.error({
                    message: 'Transaction failed',
                    description: message
                  });
                }
              }
            );
            setInTransaction(false);
          }
          console.log(status);

        }).catch(err => {
          onFail && onFail()
          const msg: string = err.toString()
          notification.error({
            message: msg
          });
          setInTransaction(false);
          console.log(err.toString())
        }
        )
      } else {
        onFail && onFail()
        notification.error({
          message: 'Address not found'
        });
      }
    },
    [active, api.registry, contract.tx, getGascomsumed, method])

  return {
    exec
  }
};


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
  const { active } = useAccounts();

  const read = useCallback(
    async (...fields: any[]) => {
      return contractQuery(active?.address as string, contract, method, ...fields);
    },
    [active, contract, method]
  );

  return {
    read
  };
};
