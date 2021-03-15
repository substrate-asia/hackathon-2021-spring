// import { useState } from 'react';
import { globalStore } from 'rekv';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { setSS58Format } from '@polkadot/util-crypto';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { bnToBn } from '@polkadot/util';
import { omit } from 'ramda';

import store from '../../stores/account';
import {
  TYPES,
  NODE_URL,
  TOKEN_TRANSFERABLE_BURNABLE,
  CLASS_METADATA,
  NATIVE_CURRENCY_ID,
} from '../../constants';

import { hexToUtf8, txLog } from '../../utils';
import { Work } from '../../types';

const unit = bnToBn('1000000000000');
const WebSocket = require('rpc-websockets').Client;

const noop = () => null;

let api: any = null;

const ss58Format = 50;
const keyring = new Keyring({ type: 'sr25519', ss58Format });

const formatAddressByKeyring = (address: string) => {
  const decodedAddress = keyring.encodeAddress(address).toString();
  console.log(decodedAddress);
  return decodedAddress;
};

// query gas needed
const nftDeposit = async (metadata: any, quantity: any) => {
  try {
    const [_, depositAll] = await api.ws.call(
      'nftmart_mintTokenDeposit',
      [metadata.length, quantity.toNumber()],
      10000,
    );
    console.log(_);
    return bnToBn(depositAll);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const initPolkadotApi = (cb?: any) => {
  if (api) return;
  // set ss58Format
  api = true;
  setSS58Format(50);
  const wsProvider = new WsProvider(NODE_URL);
  const ws = new WebSocket(NODE_URL);

  ApiPromise.create({ provider: wsProvider, types: TYPES }).then((res: any) => {
    res.ws = ws;
    globalStore.setState({ api: res });
    api = res;
    console.log('api inited ......');
    if (cb) cb();
  });
};

// get timestamp
export const getTimestamp = async () => {
  const res = await api.query.timestamp.now();
  return res;
};

// get address balance
export const getBalance = async (address: string) => {
  const { nonce, data: balance } = await api.query.system.account(address);
  store.setState({ nonce, balance });
  return balance;
};

interface classMetadata {
  name: string;
  description: string;
  url: string;
  externalUrl: string;
}

const mapClassToCollection = async (clazz: any) => {
  // FIXME: there some error in the backend, which miss { at the start of the string
  const originalString = clazz.metadata.trim().startsWith('{')
    ? clazz.metadata
    : `{ ${clazz.metadata}`;
  const metadata: classMetadata = JSON.parse(originalString);
  const collection = omit(['data', 'metadata', 'classId', 'totalIssuance'], clazz);

  return {
    ...collection,
    ...metadata,
    classId: clazz.classId ?? clazz.classID,
    id: clazz.classId ?? clazz.classID,
    totalIssuance: Number(clazz.totalIssuance),
  };
};

const filterUnparsableClass = (clazz: any) => {
  try {
    // FIXME: there some error in the backend, which miss { at the start of the string
    const originalString = clazz.metadata.trim().startsWith('{')
      ? clazz.metadata
      : `{ ${clazz.metadata}`;
    JSON.parse(originalString);
    return true;
  } catch (e) {
    return false;
  }
};

// get all classes
export const getClasses = async () => {
  // let classCount = 0
  const allClasses = await api.query.ormlNft.classes.entries();
  const data = await Promise.all(
    allClasses.map(async (c: any) => {
      let key = c[0];
      const len = key.length;
      key = key.buffer.slice(len - 4, len);
      const classId = new Uint32Array(key)[0];
      const clazz = c[1].toHuman();
      clazz.classId = classId;
      clazz.adminList = await api.query.proxy.proxies(clazz.owner);
      clazz.adminList = clazz.adminList.map((admin: any) => admin.toHuman());
      // classCount++;
      return clazz;
    }),
  );
  const result = data.filter(filterUnparsableClass).map(mapClassToCollection);
  return Promise.all(result);
};

// get class by class id
export const getClassById = async (id: string) => {
  const res = await api.query.ormlNft.classes(id); // todo metadata parse
  // todo query creator
  const clazz = JSON.parse(res);
  const adminList = await api.query.proxy.proxies(clazz.owner); // query adminList of class
  clazz.adminList = JSON.parse(adminList);
  // console.log(clazz);
  clazz.metadata = JSON.parse(hexToUtf8(clazz.metadata));
  return clazz;
};

// get nfts by class and id
export const getNft = async (classId: string, id: string) => {
  const res = await api.query.ormlNft.tokens(classId, id); // todo metadata parse
  if (res.isSome) {
    const nft = JSON.parse(res.unwrap());
    nft.metadata = JSON.parse(hexToUtf8(nft.metadata));
    nft.class = await getClassById(classId);
    // console.log(nft);
    return nft;
  }
  return null;
};

// get order by params
export const getOrder = async (classId = '', tokenId = '', onerAddr = '') => {
  const order = await api.query.nftmart.orders([classId, tokenId], onerAddr);
  if (order.isSome) {
    const res = order.toHuman();
    return res;
  }
  return null;
};

// query all categories
export const getCategories = async () => {
  let categories = await api.query.nftmart.categories.entries();
  categories = categories.map((category: any) => {
    let key = category[0];
    const data = category[1].unwrap();
    const len = key.length;
    key = key.buffer.slice(len - 4, len);
    const cateId = new Uint32Array(key)[0];
    const cate = data.toHuman();
    cate.id = cateId;
    cate.metadata = JSON.parse(cate.metadata);
    return cate;
  });

  return categories;
};

// get nft by class id
const getAllNftsByClassId = async (classId: number) => {
  const nextTokenId = await api.query.ormlNft.nextTokenId(classId);
  // let tokenCount = 0;
  let classInfo = await api.query.ormlNft.classes(classId);
  if (classInfo.isSome) {
    const arr = [];
    classInfo = classInfo.unwrap();
    // const accountInfo = await api.query.system.account(classInfo.owner);
    // console.log(classInfo.toString());
    // console.log(accountInfo.toString());
    for (let i = 0; i < nextTokenId; i += 1) {
      arr.push(api.query.ormlNft.tokens(classId, i));
    }
    const res = await Promise.all(arr);
    return res.map((n, idx) => {
      if (n.isEmpty) return null;
      const nft = n.toHuman();
      nft.classInfo = classInfo.toHuman();
      nft.tokenId = idx;
      return nft;
    });
  }
  return [];
};

const filterNonMetaNFT = (nft: null | any) => {
  if (!nft) return false;

  try {
    const originalString = nft.metadata.trim().startsWith('{') ? nft.metadata : `{ ${nft.metadata}`;
    JSON.parse(originalString);
    return true;
  } catch {
    return false;
  }
};

const getClassId = (c: any) => {
  let key = c[0];
  const len = key.length;
  key = key.buffer.slice(len - 4, len);
  return new Uint32Array(key)[0];
};

const mapNFTToAsset = (NFT: any, cid: number, tid?: number) => {
  const originalString = NFT.metadata.trim().startsWith('{') ? NFT.metadata : `{ ${NFT.metadata}`;
  const metadata = JSON.parse(originalString);

  return {
    ...NFT,
    ...metadata,
    metadata,
    classId: cid,
    tokenId: tid,
  };
};

const mapNFTsToAsset = (NFTS: any[], cid: number) => {
  return NFTS.map((nft, tokenId) => ({ ...nft, tokenId }))
    .filter(filterNonMetaNFT)
    .map((n, idx) => mapNFTToAsset(n, cid, idx));
};

// get all nfts
export const getAllNfts = async (classId?: number): Promise<Work[]> => {
  if (classId === undefined) {
    const allClasses = await api.query.ormlNft.classes.entries();
    const result = await Promise.all(
      allClasses.map(async (c: any) => {
        const cid = getClassId(c);
        const nfts: any = await getAllNftsByClassId(cid);
        return mapNFTsToAsset(nfts, cid);
      }),
    );
    // flatten list of list by depth 1
    return result.flat() as Work[];
  }
  return mapNFTsToAsset(await getAllNftsByClassId(classId), classId);
};

// get all orders
export const getAllOrders = async () => {
  const allOrders = await api.query.nftmart.orders.entries();

  const arr = allOrders.map(async (order: any) => {
    const key = order[0];
    const keyLen = key.length;
    const orderOwner = keyring.encodeAddress(new Uint8Array(key.buffer.slice(keyLen - 32, keyLen)));

    const classId = new Uint32Array(key.slice(keyLen - 4 - 8 - 32 - 16, keyLen - 8 - 32 - 16))[0];
    const tokenIdRaw = new Uint32Array(key.slice(keyLen - 8 - 32 - 16, keyLen - 32 - 16));

    const tokenIdLow32 = tokenIdRaw[0];
    const tokenIdHigh32 = tokenIdRaw[1];
    const tokenId = tokenIdLow32;
    let nft = await api.query.ormlNft.tokens(classId, tokenId);
    if (nft.isSome) {
      nft = nft.unwrap().toHuman();
    }

    const data = order[1].toHuman();
    data.orderOwner = orderOwner;
    data.classId = classId;
    data.tokenId = tokenId;
    data.nft = nft;

    return data;
  });
  const orders = await Promise.all(arr);
  return orders;
};

// query users class
export const queryNftByAddress = async ({ address = '' }) => {
  const nfts = await api.query.ormlNft.tokensByOwner.entries(address);

  const arr = nfts.map(async (clzToken: any) => {
    const clzTokenObj = clzToken[0];
    const len = clzTokenObj.length;

    const classId = new Uint32Array(clzTokenObj.slice(len - 4 - 8, len - 8))[0];
    const tokenIdRaw = new Uint32Array(clzTokenObj.slice(len - 8, len));

    const tokenIdLow32 = tokenIdRaw[0];
    // const tokenIdHigh32 = tokenIdRaw[1];
    const tokenId = tokenIdLow32;

    let nft = await api.query.ormlNft.tokens(classId, tokenId);
    if (nft.isSome) {
      nft = nft.toHuman();
      return mapNFTToAsset(nft, classId, tokenId);
    }
    return null;
  });
  const res = await Promise.all(arr);
  return res.filter(filterNonMetaNFT);
};

// query users class
export const queryClassByAddress = async ({ address = '' }) => {
  const allClasses = await api.query.ormlNft.classes.entries();

  const arr = allClasses.map(async (clz: any) => {
    let key = clz[0];
    const len = key.length;
    key = key.buffer.slice(len - 4, len);
    const classId = new Uint32Array(key)[0];
    const clazz = clz[1].toJSON();
    clazz.metadata = hexToUtf8(clazz.metadata.slice(2));
    clazz.classId = classId;
    clazz.adminList = await api.query.proxy.proxies(clazz.owner);

    const res = clazz.adminList[0].map((admin: any) => {
      const adminAddress = admin.delegate.toString();
      // console.log('cl', clazz);
      // console.log('check admin list', adminAddress, address);

      if (adminAddress === address) {
        return clazz;
      }
      return null;
    });
    return res.length > 0 ? res[0] : null;
  });
  const res = (await Promise.all(arr)).filter(filterUnparsableClass).map(mapClassToCollection);
  return Promise.all(res);
};

// === post api ====

// create collections
// cb is callback for trx on chain   (status) => { ... }
export const createClass = async ({
  address = '',
  metadata = CLASS_METADATA,
  cb = { success: noop, error: (err: any) => err },
}) => {
  try {
    const injector = await web3FromAddress(address);
    const { name, description } = metadata;
    const metadataStr = JSON.stringify(metadata);
    const res = await api.tx.nftmart
      .createClass(metadataStr, name, description, TOKEN_TRANSFERABLE_BURNABLE)
      .signAndSend(address, { signer: injector.signer }, (result: any) =>
        txLog(result, cb.success),
      );
    // console.log(res, res);
    return res;
  } catch (error) {
    cb.error(error.toString());
    return null;
  }
};

// mint nft under class
// cb is callback for trx on chain   (status) => { ... }
export const mintNft = async ({
  address = '',
  classId = 0,
  metadata = {},
  quantity = 1,
  cb = { success: noop, error: (err: any) => err },
}) => {
  try {
    const injector = await web3FromAddress(address);
    const metadataStr = JSON.stringify(metadata);
    const balancesNeeded = await nftDeposit(metadataStr, bnToBn(quantity));
    if (balancesNeeded === null) return null;
    const classInfo = await api.query.ormlNft.classes(classId);
    if (!classInfo.isSome) {
      // console.log('classInfo not exist');
      return null;
    }
    const ownerOfClass = classInfo.unwrap().owner.toString();

    const txs = [
      // make sure `ownerOfClass0` has sufficient balances to mint nft.
      api.tx.balances.transfer(ownerOfClass, balancesNeeded),
      // mint nft.
      api.tx.proxy.proxy(
        ownerOfClass,
        null,
        api.tx.nftmart.mint(address, classId, metadataStr, quantity),
      ),
    ];
    const batchExtrinsic = api.tx.utility.batchAll(txs);
    const res = await batchExtrinsic.signAndSend(
      address,
      { signer: injector.signer },
      (result: any) => txLog(result, cb.success),
    );
    return res;
  } catch (error) {
    cb.error(error.toString());
    return null;
  }
};

// create order
export const createOrder = async ({
  address = '', // address of current user
  categoryId = 0, // category id
  deposit = 200, // stake number of NMT
  price = 1, // list price
  classId = 0, // class id
  tokenId = 0, // token id
  during = 5000, // during block num ,need to be conver from timestamp
  cb = { success: noop, error: (err: any) => err },
}) => {
  try {
    const injector = await web3FromAddress(address);
    const currentBlockNumber = bnToBn(await api.query.system.number());

    // convert on chain precision
    const priceAmount = unit.mul(bnToBn(price));
    const depositAmount = unit.mul(bnToBn(deposit));
    const call = api.tx.nftmart.submitOrder(
      NATIVE_CURRENCY_ID,
      priceAmount,
      categoryId,
      classId,
      tokenId,
      depositAmount,
      currentBlockNumber.add(bnToBn(during)),
    );
    // const feeInfo = await call.paymentInfo(account);
    await call.signAndSend(address, { signer: injector.signer }, (result: any) =>
      txLog(result, cb.success),
    );
  } catch (error) {
    cb.error(error.toString());
  }
};

// take order
export const takeOrder = async ({
  address = '', // address of current user
  ownerAddress = '', // owner address
  classId = 0, // class id
  tokenId = 0, // token id
  price = 0, // order price
  cb = { success: noop, error: (err: any) => err },
}) => {
  try {
    const injector = await web3FromAddress(address);
    let order = await api.query.nftmart.orders([classId, tokenId], ownerAddress);
    if (order.isSome) {
      const priceAmount = unit.mul(bnToBn(price));
      order = order.unwrap();
      const call = api.tx.nftmart.takeOrder(classId, tokenId, priceAmount, ownerAddress);
      const res = await call.signAndSend(address, { signer: injector.signer }, (result: any) =>
        txLog(result, cb.success),
      );
      return res;
    }
    return null;
  } catch (error) {
    cb.error(error.toString());
    return null;
  }
};

// delete order
export const updateOrderPrice = async ({
  address = '', // address of current user
  ownerAddress = '', // owner address
  classId = 0, // class id
  tokenId = 0, // token id
  price = 0, // new price
  cb = txLog,
}) => {
  const injector = await web3FromAddress(address);
  let order = await api.query.nftmart.orders([classId, tokenId], ownerAddress);

  if (order.isSome) {
    // convert on chain precision
    const priceAmount = unit.mul(bnToBn(price));
    order = order.unwrap();
    const call = api.tx.nftmart.updateOrderPrice(classId, tokenId, priceAmount);
    const res = await call.signAndSend(address, { signer: injector.signer }, cb);
    return res;
  }
  return null;
};

// delete order
export const deleteOrder = async ({
  address = '', // address of current user
  ownerAddress = '', // owner address
  classId = 0, // class id
  tokenId = 0, // token id
  cb = { success: noop, error: (err: any) => err },
}) => {
  try {
    const injector = await web3FromAddress(address);
    let order = await api.query.nftmart.orders([classId, tokenId], ownerAddress);
    if (order.isSome) {
      order = order.unwrap();
      const call = api.tx.nftmart.removeOrder(classId, tokenId);
      const res = await call.signAndSend(address, { signer: injector.signer }, (result: any) =>
        txLog(result, cb.success),
      );
      return res;
    }
    return null;
  } catch (error) {
    cb.error(error.toString());
    return null;
  }
};
