import React, { useEffect, useMemo, useState } from 'react';
import { Center, Spinner, Button, Box, Text, Heading } from '@chakra-ui/react';
import { globalStore } from 'rekv';
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
  web3AccountsSubscribe,
} from '@polkadot/extension-dapp';
import { useTranslation } from 'react-i18next';

import walletLogo from '../../assets/polkadot.png';
import { initPolkadotApi, getCategories } from './index';
import store from '../../stores/categories';

interface Props {
  children: React.ReactNode;
}

const provider = ({ children }: Props) => {
  // init polkadot api
  const queryCategories = async () => {
    let categories = await getCategories();
    categories = categories.map((cat: any) => {
      return cat.metadata.name;
    });
    store.setState({ categories });
  };
  initPolkadotApi(queryCategories);

  const { t } = useTranslation();

  const { api, accounts = null } = globalStore.useState('api', 'accounts');
  // extension inject status
  const [injected, setInjected] = useState(false);

  const accessAvailable = useMemo(() => api && injected && accounts, [api, injected, accounts]);

  useEffect(() => {
    const initExtension = async () => {
      const allInjected = await web3Enable('NFTMart');
      if (allInjected.length === 0) {
        setInjected(false);
      } else {
        setInjected(true);
        // get accounts info in extension
        const injectedAccounts = await web3Accounts();
        if (injectedAccounts.length !== 0) {
          // treat first account as signer
          const injector = await web3FromSource(injectedAccounts[0].meta.source);
          globalStore.setState({
            accounts: injectedAccounts,
            account: injectedAccounts[0],
            injector,
          });
          // TODO add backend integration
        }
      }

      // subscribe and update defaultaccount
      const unsubscribe = await web3AccountsSubscribe(async (reInjectedAccounts) => {
        // console.log(reInjectedAccounts);

        if (!reInjectedAccounts.length) {
          return;
        }

        const injector = await web3FromSource(reInjectedAccounts[0].meta.source);
        globalStore.setState({
          accounts: reInjectedAccounts,
          account: reInjectedAccounts[0],
          injector,
        });
      });
    };
    initExtension();
  }, []);

  // return children;

  return (
    <>
      {accessAvailable ? (
        children
      ) : (
        <Center h="100vh" w="100vw">
          {!injected ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Heading as="h4" size="md">
                {t('extension.dowload')}
              </Heading>
              <Box alt="waleet_logo" as="img" src={walletLogo} width="160px" margin="30px auto" />
              <Button
                width="160px"
                variant="primary"
                onClick={() => window.open('https://polkadot.js.org/extension/', '_blank')}
                isFullWidth
              >
                {t('download')}
              </Button>
            </Box>
          ) : (
            <Box>
              {accounts ? (
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
              ) : (
                <Heading as="h4" size="md">
                  {t('extension.account')}
                </Heading>
              )}
            </Box>
          )}
        </Center>
      )}
    </>
  );
};

export default provider;
