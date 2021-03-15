import React, { ReactNode, FC, useState, useEffect, useRef, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

export interface ApiContextData {
  api: ApiPromise;
  isApiConnected: boolean;
  isApiError: boolean;
  chainInfo: {
    chainName: string;
  };
  init: (url:string) => void; // connect to network

}
// ensure that api always exist
export const ApiContext = React.createContext<ApiContextData>({} as ApiContextData);

interface Props {
  children: ReactNode;
}
export const ApiProvider: FC<Props> = ({
  children
}) => {
  // api instance
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise);

  // chain information
  const [chainName, setChainName] = useState<string>('');

  // status
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
  const [isApiError, setIsApiError] = useState<boolean>(false);
  const apiSubscriber = useRef<any>();


  // connect api
  const init = useCallback((url) => {
    if (apiSubscriber.current) return;
    // testnet endpoint
    const wsProvider = new WsProvider(url);
    apiSubscriber.current = new ApiPromise({ 
      provider: wsProvider,
      types: {
        Address: 'MultiAddress',
        LookupSource: 'MultiAddress',
        BlockLength: 'u32',
        Slot: 'u64'
      } 
    });
    apiSubscriber.current.on('ready', () => {
      setApi(apiSubscriber.current)
      setIsApiError(false)
      setIsApiConnected(true);
      setIsApiError(false);
    })
  }, [])

  useEffect(() => {
    if (!isApiConnected) return;

    api.rpc.system.chain().then((result) => {
      setChainName(result.toString());
    });
  }, [api, isApiConnected]);

  useEffect(() => {
    if (!isApiConnected) return;

    api.on('disconnected', () => {
      setIsApiConnected(false);
      setIsApiError(false);
    });
    api.on('error', () => {
      setIsApiConnected(false);
      setIsApiError(true);
    });
    api.on('connected', () => {
      setIsApiConnected(true);
      setIsApiError(false);
    });
  }, [api, isApiConnected]);

  return (
    <ApiContext.Provider
      value={
        {
          api,
          isApiConnected,
          isApiError,
          chainInfo: {
            chainName
          },
          init
        }
      }>
      {children}
    </ApiContext.Provider>
  )
}