
// Steem Config
export const STEEM_API_URLS = [
  process.env.STEEM_API_URL || 'https://api.justyy.com',
  'https://cn.steems.top',
  'https://api.steemit.com',
  'https://api.justyy.com',
  'https://aksaiapi.wherein.mobi'
]

export const STEEM_CONF_KEY = 'steemNodeKey'

export const LOCALE_KEY = 'localeLanguage'


export const POST_LINK_REG = /@[\w\.\-]+\/[\w\-]+\/?$/;


export const DNUT_TRANSFER_FEE = 0.001
export const TRANSFER_FEE_RATIO = 0.000001

//  steem account
export const STEEM_DEX_ACCOUNT = process.env.STEEM_DEX_ACCOUNT || 'nutbox.dex'
export const STEEM_GAS_ACCOUNT = process.env.STEEM_GAS_ACCOUNT || 'nutbox.gas'
export const STEEM_MINE_ACCOUNT = process.env.STEEM_MINE_ACCOUNT || 'nutbox.mine'
export const STEEM_TSP_ACCOUNT = process.env.STEEM_TSP_ACCOUNT || 'nutbox-tsp'
export const STEEM_DONUT_ACCOUNT = process.env.STEEM_DONUT_ACCOUNT || 'donut.nutbox'

// polkadot
export const POLKADOT_WEB_SOCKET = "wss://rpc.donut.nutbox.io"
export const DONUT_PRECISION = 10 ** 12;
