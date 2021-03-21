// 引入
import { ApiPromise, WsProvider } from '@polkadot/api';

export const connect = async () => {
  // 创建 api 对象
  const wsProvider = new WsProvider('ws://localhost:9944');
  const api = await ApiPromise.create({ provider: wsProvider });
  api.derive.chain.bestNumberFinalized((number) => {
    // console.log(number.words[0]);
  });
};
