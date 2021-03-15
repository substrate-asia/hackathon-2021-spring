import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import React, { useEffect, useMemo, useState } from 'react';
import { ApiContext } from './api-context';

async function waitWeb3Inject(ms: number = 5000): Promise<void> {
  const delay = () => new Promise((resolve) => setTimeout(resolve, 100));

  return new Promise((resolve) => {
    window.onload = async () => {
      const start = Date.now();

      while(true) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (Object.keys(((window as unknown) as any).injectedWeb3).length !== 0) {
          break;
        } else {
          if (Date.now() - ms > start) {
            break;
          }
        }
        await delay();
      }
      resolve();
    }
  });
}

interface Props {
  children: React.ReactNode;
  url?: string;
}

export const ApiProvider = React.memo(function Api({ children }: Props): React.ReactElement<Props> | null {
  const [ isApiReady, setIsReady ] = useState<boolean>(false);
  const [ api, setApi ] = useState<ApiPromise>({} as ApiPromise);
  
  useEffect(() => {
    waitWeb3Inject()
      .then(() => web3Enable('polkadosst-js/apps'))
      .then(() => web3Accounts())
      .then(accounts => {
        const wsProvider = new WsProvider('wss://ws.jupiter-poa.patract.cn/');
        const apiPromise = new ApiPromise({
          provider: wsProvider,
        });

        apiPromise.on('ready', _api => {
          keyring.loadAll({ ss58Format: 26, type: 'sr25519' }, accounts.map(
            ({ address, meta }, whenCreated) => ({
              address,
              meta: {
                ...meta,
                name: `${meta.name || 'unknown'} (${meta.source === 'polkadot-js' ? 'extension' : meta.source})`,
                whenCreated,
              }
            })
          ));
          setApi(_api);
          setIsReady(true);
          console.log('ready', _api);
        });
        apiPromise.on('error', (error: Error) => console.log('error', error));
        apiPromise.on('connected', () => console.log('connected'));
        apiPromise.on('disconnected', () => console.log('disconnected'));
      });
  }, []);

  const value = useMemo(() => ({
    isApiReady,
    api,
  }), [api, isApiReady]);

  return <ApiContext.Provider value={ value }>{children}</ApiContext.Provider>;
});
