export const TYPES = {
  Properties: 'u8',
  NFTMetadata: 'Vec<u8>',
  BlockNumber: 'u32',
  BlockNumberOf: 'BlockNumber',

  OrderData: {
    currencyId: 'Compact<CurrencyIdOf>',
    price: 'Compact<Balance>',
    deposit: 'Compact<Balance>',
    deadline: 'Compact<BlockNumberOf>',
    categoryId: 'Compact<CategoryIdOf>',
  },

  CategoryId: 'u32',
  CategoryIdOf: 'CategoryId',
  CategoryData: {
    metadata: 'NFTMetadata',
    nftCount: 'Compact<Balance>',
  },

  CurrencyId: 'u32',
  CurrencyIdOf: 'CurrencyId',
  Amount: 'i128',
  AmountOf: 'Amount',

  ClassId: 'u32',
  ClassIdOf: 'ClassId',
  ClassInfoOf: {
    metadata: 'NFTMetadata',
    totalIssuance: 'TokenId',
    owner: 'AccountId',
    data: 'ClassData',
  },
  ClassData: {
    deposit: 'Compact<Balance>',
    properties: 'Properties',
    name: 'Vec<u8>',
    description: 'Vec<u8>',
    createBlock: 'Compact<BlockNumberOf>',
  },

  TokenId: 'u64',
  TokenIdOf: 'TokenId',
  TokenInfoOf: { metadata: 'NFTMetadata', owner: 'AccountId', data: 'TokenData' },
  TokenData: {
    deposit: 'Compact<Balance>',
    createBlock: 'Compact<BlockNumberOf>',
  },
};

export const NAV_MAP: Record<string, string> = {
  'nav.home': '/',
  'nav.explore': '/explore',
  'nav.list-sale': '/explore?status=listing',
  // 'nav.latest-create': '/explore?status=new',
  // 'nav.latest-strike': '/explore?status=recent',
};

export const USER_LINKS: Record<string, string> = {
  'quick-area.wallet': '/wallet',
  'quick-area.collections': '/collections',
  'quick-area.nft.create': '/create',
  // 'quick-area.profile.edit': '/profile',
};

// online
export const DBURL = 'http://localhost:8888/graphql';
export const IPFS_POST_SERVER = 'https://ipfs-api.bcdata.top'; // ipfs node
export const IPFS_GET_SERVER = 'https://ipfs-web.bcdata.top/ipfs/'; // query with cid server
export const NODE_URL = 'wss://dot.bcdata.top';

// test
// export const DBURL = 'http://localhost:8888/graphql';
// export const IPFS_POST_SERVER = 'http://59.110.115.146:5001'; // ipfs node
// export const IPFS_GET_SERVER = 'http://59.110.115.146:8080/ipfs/'; // query with cid server
// export const NODE_URL = 'ws://8.136.111.191:9944';

// 	 Token can be transferred
// 	Transferable = 0b00000001
// 	 Token can be burned
// 	Burnable = 0b00000010
export const TOKEN_TRANSFERABLE_BURNABLE = 0b00000011;

// class metadata
export const CLASS_METADATA = {
  name: '', // name of nft asset
  bannerUrl: '', // banner media url of class
  url: '', // class img url of class
  externalUrl: '', // website url
  description: '', // nft desc
};

// nft metadata
export const NFT_METADATA = {
  name: '', // name of nft asset
  type: 'image', // image | gif | video | audio | article —— use image first
  url: '', // media url ipfs cid
  externalUrl: '', // website url
  description: '', // nft desc
  backgroundColor: '', //  color #ffffff
  traits: [], // nft propos
};

export const Z_INDEXES = {
  // popover's index - 1
  header: 9,
  typeFilter: 9,
  banner: 8,
};

export type MetaData = {
  name: string;
  bannerUrl?: string;
  url: string;
  externalUrl: string;
  description: string;
  traits?: [];
  backgroundColor: string;
};

export const NATIVE_CURRENCY_ID = 0;
