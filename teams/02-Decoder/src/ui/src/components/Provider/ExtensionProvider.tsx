import React, { createContext, Dispatch, FC, memo, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react';

import store from 'store';
import { useTranslation } from '@/components';
import { Modal } from 'antd';

import { InjectedAccount } from '@polkadot/extension-inject/types';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { useApi } from '@/hooks';
import { InjectedExtension } from '@polkadot/extension-inject/types';


export const NoAccounts: FC = memo(() => {
  const handleRetry = (): void => window.location.reload();
  const { t } = useTranslation();

  return (
    <Modal
      okText={t('Retry')}
      onOk={handleRetry}
      visible={true}
    >
      <p>
        {t('No account found')}
      </p>
    </Modal>
  );
});
NoAccounts.displayName = 'NoAccounts';

const POLKADOT_EXTENSION_PAGE = 'https://polkadot.js.org/extension';

export const NoExtensions: React.FC = memo(() => {
  const handleGetExtensionBtnClick = useCallback((): void => {
    window.open(POLKADOT_EXTENSION_PAGE);
  }, []);
  const { t } = useTranslation();

  return (
    <Modal
      okText={t('GET IT')}
      onOk={handleGetExtensionBtnClick}
      visible={true}
    >
      <p>{t('No polkadotjs extension found')}</p>
      <a
        href={POLKADOT_EXTENSION_PAGE}
        rel='noopener noreferrer'
        target='_blank'
      >{t('Get Polkadot.js Extension')}</a>
    </Modal>
  );
});
NoExtensions.displayName = 'NoExtensions';


export interface ExtensionData {
  isApiReady: boolean;
  accounts?: InjectedAccount[];
  active?: InjectedAccount;
  setCurrentAccount: (address: string | InjectedAccount) => Promise<void>;
  selectAccountStatus: boolean;
  setSelectAccountStatus: Dispatch<SetStateAction<boolean>>;
}

export const ExtensionContext = createContext<ExtensionData>({} as any);

export const ExtensionProvider: FC = ({ children }) => {
  const { api } = useApi()
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [active, setActive] = useState<InjectedAccount | undefined>();
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [extension, setExtension] = useState<InjectedExtension | undefined>();
  const [selectAccountStatus, setSelectAccountStatus] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<{
    noExtension?: boolean;
    noAccount?: boolean;
  }>({ noAccount: false, noExtension: false });

  const renderError = useCallback((): ReactNode => {

    if (errorStatus.noAccount) {
      return <NoAccounts />;
    }

    if (errorStatus.noExtension) {
      return <NoExtensions />;
    }

    return null;
  }, [errorStatus]);

  const setCurrentAccount = useCallback(async (address: string | InjectedAccount): Promise<void> => {
    if (!api || !address || !extension || !accounts.length) return;

    // extract address
    address = (typeof address === 'string') ? address : address.address;

    try {
      const account = accounts.find((item) => item.address === address);
      const injector = await web3FromAddress(address);

      if (account) {
        api.setSigner(injector.signer);
        setIsApiReady(true);
        setActive(account);
        store.set(`SublendAccount`, address);
        setSelectAccountStatus(false);
      } else {
        throw new Error('could not found the address in the extension');
      }
    } catch (e) {
      setIsApiReady(false);
    }
  }, [api, setIsApiReady, extension, accounts, setSelectAccountStatus]);

  // get extension
  useEffect(() => {
    if (!api.isConnected) return;

    const asyncFetch = async () => {
      try {
        const extensions = await web3Enable('SubLend');

        if (extensions.length === 0) throw new Error('no extensions');

        setExtension(extensions[0]);
      }
      catch (error) {
        setErrorStatus({ noExtension: true });
      }
    }
    asyncFetch()
  }, [api, setExtension, setErrorStatus]);

  // check if need upload metadata and subscribe accounts
  useEffect(() => {
    if (!extension) return;

    const unsub = extension?.accounts.subscribe((accounts) => {
      setErrorStatus({ noAccount: accounts.length === 0 });

      setAccounts(accounts);
    });


    return (): void => {
      unsub && unsub();
    };
  }, [extension, setAccounts, setErrorStatus]);

  // load active account
  useEffect(() => {
    if (!accounts.length) return;
    if (!api) return;

    const saved = store.get(`SublendAccount`);

    // check if saved account is available in accounts
    const isSavedAccountAvailable = !!accounts.find((item) => item.address === saved);

    if (saved && isSavedAccountAvailable) {
      setCurrentAccount(saved);

      return;
    }

    if (accounts.length === 1) {
      setCurrentAccount(accounts[0].address);

      return;
    }

    setSelectAccountStatus(true);
  }, [api, accounts, setSelectAccountStatus, setCurrentAccount]);

  return (
    <ExtensionContext.Provider
      value={{
        isApiReady,
        active,
        accounts,
        setCurrentAccount,
        selectAccountStatus,
        setSelectAccountStatus
      }}
    >
      {children}
      {renderError()}
    </ExtensionContext.Provider>
  )
}