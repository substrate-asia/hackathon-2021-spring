import { ExampleAddr } from '../contracts/contract-address';
import { useContract } from './use-contract';
import ExampleAbi from '../contracts/bridge_example.json';

export const useExampleContract = () => {
  return useContract(ExampleAddr, ExampleAbi);
};
