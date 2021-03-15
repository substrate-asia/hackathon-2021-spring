import { useBalance } from '@/hooks';
import React from 'react';


export const BalanceBox: React.FC = () => {
  const balance = useBalance();
  return balance ? <span>{balance}</span> : <div>-</div>;
};
