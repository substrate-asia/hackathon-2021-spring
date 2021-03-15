import React from 'react';
import { AccountContext } from './account-context';

export const AccountProvider: React.FC = ({ children }) => {
  // console.log('account provider');
  // const { isApiReady } = useApi();
  // const [currentAccount, setCurrentAccount] = useState<string>('');

  // useMemo(() => {
  //   if (!isApiReady) return;
  //   keyring.loadAll(
  //     {
  //       genesisHash: api.genesisHash,
  //       isDevelopment,
  //       ss58Format,
  //       store,
  //       type: 'sr25519'
  //     },
  //     injectedAccounts
  //   );
  //   const accounts = keyring.getPairs();
  //   setCurrentAccount(accounts[0]?.address);
  // }, [isApiReady]);

  // const value = useMemo(
  //   () => ({
  //     currentAccount,
  //   }),
  //   [currentAccount],
  // );

  return <AccountContext.Provider value={{ currentAccount: '5C8R1N8L6jZJu9Cm4RzdASggyjfzCBJgxFMMq1PDHeraw7eJ' }}>{children}</AccountContext.Provider>;
};