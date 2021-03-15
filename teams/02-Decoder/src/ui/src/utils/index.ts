
import { BigNumber } from "bignumber.js";

export const FormatAddress = (address: string | undefined) : string | null =>{
    if (!address) return null;
    return address.substring(0,6) + '...' + address.substring(42);
}

export interface balanceFormatterProps {
    num: number;
    string: string;
  }
  
export const balanceFormatter = (balance: string | number, dm = 13): balanceFormatterProps => {
  if(!balance) {
    return {
      num: 0,
      string: '0'
    }
  }
  const num = new BigNumber(balance.toString()).div(10 ** dm).decimalPlaces(4)
  
  return {
    num: num.toNumber(),
    string: num.toString()
  };
}