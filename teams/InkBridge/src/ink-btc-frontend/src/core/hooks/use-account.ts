import { useContext } from 'react';
import { AccountContext } from '../context/account-context';
import { AccountProps } from '../types/account';

export function useAccount(): AccountProps {
  return useContext(AccountContext);
}
