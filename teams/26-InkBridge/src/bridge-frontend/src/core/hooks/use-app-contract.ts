import { ApplicationAddr } from '../contracts/contract-address';
import { useContract } from './use-contract';
import appAbi from '../contracts/bridge_example.json';

export const useAppContract = () => {
  return useContract(ApplicationAddr, appAbi);
};
