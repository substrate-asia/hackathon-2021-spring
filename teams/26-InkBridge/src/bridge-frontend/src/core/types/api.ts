import { ApiPromise } from '@polkadot/api';

export interface ApiProps {
  api: ApiPromise;
  isApiReady: boolean;
}