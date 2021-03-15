import { KeyringPair } from '@polkadot/keyring/types';

export type AccountProps = {
  currentAccount?: KeyringPair;
  accounts: KeyringPair[];
  setCurrentAccount: (account: KeyringPair) => void;
};
