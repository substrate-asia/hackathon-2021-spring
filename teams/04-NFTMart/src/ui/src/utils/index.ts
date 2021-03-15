import BigNumber from 'bignumber.js';
import { curry, apply } from 'ramda';

type NumberValue = string | number;

// Parse router query by path
export const parseQuery = (search: string) => {
  const query = search.substring(1);
  const vars = query.split('&');
  const queryMap: Record<string, string> = {};
  for (let i = 0; i < vars.length; i += 1) {
    const [key, value] = vars[i].split('=');
    queryMap[key] = value;
  }
  return queryMap;
};

// eslint-disable-next-line no-underscore-dangle
export const debounce_ = curry((immediate: boolean, fn: (...args: any[]) => any, timeMs = 1000) => {
  let timeout: NodeJS.Timeout | null;

  return (...args: any[]) => {
    const later = () => {
      timeout = null;

      if (!immediate) {
        apply(fn, args);
      }
    };

    const callNow = immediate && !timeout;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    clearTimeout(timeout!);
    timeout = setTimeout(later, timeMs);

    if (callNow) {
      apply(fn, args);
    }

    return timeout;
  };
});

export const debounceImmediate = debounce_(true);

export const debounce = debounce_(false);

// Number utils
export const toBigNumber = (n: NumberValue) => new BigNumber(String(n));

export const toFixedDecimals = (n: NumberValue, place = 8) => toBigNumber(n).toFormat(place);

export default {};
export const utf8ToHex = (s: string) => {
  const utf8encoder = new TextEncoder();
  const rb: any = utf8encoder.encode(s);
  let r = '';
  //   for (const b of rb) {
  //     r += ('0' + b.toString(16)).slice(-2);
  //   }
  rb.map((b: any) => {
    r += `0${b.toString(16).slice(-2)}`;
    return '';
  });
  return r;
};
export const hexToUtf8 = (s: string) => {
  const str = s.slice(2);
  return decodeURIComponent(
    str
      .replace(/\s+/g, '') // remove spaces
      .replace(/[0-9a-f]{2}/g, '%$&'), // add '%' before each 2 characters
  );
};

// trx log
export const txLog = (result: any, onSuccess = (res: any) => res) => {
  console.log(`Current status is ${result.status}`);

  if (result.status.isInBlock) {
    console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
  } else if (result.status.isFinalized) {
    onSuccess(result);
    console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
  }
};
