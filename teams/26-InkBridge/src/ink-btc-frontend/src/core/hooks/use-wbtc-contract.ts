import { WbtcAddr } from '../contracts/contract-address';
import { useContract } from './use-contract';
import WBTCAbi from '../contracts/erc20_issue.json';

export const useWBTCContract = () => {
  return useContract(WbtcAddr, WBTCAbi);
};
