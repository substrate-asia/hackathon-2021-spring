import keyring from '@polkadot/ui-keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import React, { useMemo, useState } from 'react';
import { useApi } from '../hooks/use-api';
import { AccountContext } from './account-context';
export const AccountProvider: React.FC = ({ children }) => {
  const { isApiReady } = useApi();
  const [currentAccount, setCurrentAccount] = useState<KeyringPair>();
  const [accounts, setAccounts] = useState<KeyringPair[]>([]);

  useMemo(() => {
    if (!isApiReady) return;

    const _accounts = keyring.getPairs();
    console.log('accounts', _accounts);
    setAccounts(_accounts);
    setCurrentAccount(_accounts[0]);
  }, [isApiReady]);

  return <AccountContext.Provider value={{ currentAccount, accounts, setCurrentAccount }}>{children}</AccountContext.Provider>;
};