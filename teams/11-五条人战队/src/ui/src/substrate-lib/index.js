import { web3FromSource } from '@polkadot/extension-dapp';
import {
  SubstrateContextProvider, useSubstrate
} from './SubstrateContext';
import utils from './utils';
import { AccountsContextProvider, useAccounts } from './AccountsContext'



const getFromAcct = async (accountPair, api) => {
  const {
      address,
      meta: { source, isInjected }
  } = accountPair;
  let fromAcct;

  // signer is from Polkadot-js browser extension
  if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
  } else {
      fromAcct = accountPair;
  }

  return fromAcct;
};


export { 
  useSubstrate, SubstrateContextProvider, utils,
  useAccounts, AccountsContextProvider,
  getFromAcct, 
};
