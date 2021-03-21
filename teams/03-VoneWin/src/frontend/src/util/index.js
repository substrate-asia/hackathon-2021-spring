/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2021-02-25 15:24:25
 */
/**
 * 动态插入css
 */
import { ApiPromise, WsProvider } from '@polkadot/api';
export const loadStyle = url => {
  const link = document.createElement('link');

  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];

  head.appendChild(link);
};

export const errTips = async result => {
  let isSuccess = false;
  await result.events
    .filter(({ event: { section } }) => section === 'system')
    .forEach(({ event: { data, method } }) => {
      if (method === 'ExtrinsicFailed') {
        const [dispatchError] = data;
        if (dispatchError.isModule) {
          try {
            const mod = dispatchError.asModule;
            const error = data.registry.findMetaError(
              new Uint8Array([mod.index.toNumber(), mod.error.toNumber()])
            );
            console.log('错误提示:', error.name); //错误提示
          } catch (error) {
            console.log(error);
          }
        }
      } else if (method === 'ExtrinsicSuccess') {
        isSuccess = true;
        console.log('成功');
      }
    });
  return {
    isSuccess
  };
};

// 字典根据value反查label
export const getLabelByValue = (data, value) => {
  let label = '';
  for (let i = 0; i < data.length; i++) {
    if (data[i].value === value) {
      label = data[i].label;
      continue;
    }
  }
  return label;
};

export function dateFormat() {
  let format = arguments[1] || 'yyyy-MM-dd hh:mm:ss';

  let date = typeof arguments[0] !== 'object' ? new Date(arguments[0]) : arguments[0];

  if (date !== 'Invalid Date') {
    let o = {
      'M+': date.getMonth() + 1, // month
      'd+': date.getDate(), // day
      'h+': date.getHours(), // hour
      'm+': date.getMinutes(), // minute
      's+': date.getSeconds(), // second
      'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
      S: date.getMilliseconds() // millisecond
    };

    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(String(o[k]).length)
        );
      }
    }
    return format;
  }
  return '';
}

export const createApiPromise = async () => {
  // 指定远端接口
  const wsProvider = new WsProvider('wss://asset-rpc.vonechain.com/');
  // 创建接口
  const api = await ApiPromise.create({ provider: wsProvider });
  return api;
};

// 合约地址
export const contractAddress = '5G9XnfVEi1hUtNUFAPBmCRVrfWaZ65T2het5wqcxNpjAiJp9';
