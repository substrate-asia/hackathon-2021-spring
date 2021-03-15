import { useContract } from './use-contract';
import BridgeABI from '../contracts/btc_bridge.json';
import { BridgeAddr } from '../contracts/contract-address';

export const useBridgeContract = () => {
  return useContract(BridgeAddr, BridgeABI);
};