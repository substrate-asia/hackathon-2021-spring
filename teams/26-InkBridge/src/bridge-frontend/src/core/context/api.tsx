import { ApiPromise, WsProvider } from '@polkadot/api';
import React, { useEffect, useMemo, useState } from 'react';
import { ApiContext } from './api-context';

interface Props {
  children: React.ReactNode;
  url?: string;
}

export const ApiProvider = React.memo(function Api({ children }: Props): React.ReactElement<Props> | null {
  console.log('api');
  const [ isApiReady, setIsReady ] = useState<boolean>(false);
  const [ api, setApi ] = useState<ApiPromise>({} as ApiPromise);
  
  useEffect(() => {
    const wsProvider = new WsProvider('wss://ws.jupiter-poa.patract.cn/');
    const apiPromise = new ApiPromise({
      provider: wsProvider,
    });

    apiPromise.on('ready', _api => {
      console.log('ready', _api);
      setApi(_api);
      setIsReady(true);
    });
    apiPromise.on('error', (error: Error) => console.log('error', error));
    apiPromise.on('connected', () => console.log('connected'));
    apiPromise.on('disconnected', () => console.log('disconnected'));
  }, []);

  const value = useMemo(() => ({
    isApiReady,
    api,
  }), [api, isApiReady]);

  return <ApiContext.Provider value={ value }>{children}</ApiContext.Provider>;
});