'use strict';

const CONFIG = {
  /* system */
  PID_FILE_DIR: '/var/deeper/runtime/',
  LOG_FILE_DIR: '/var/deeper/runtime/',
  UUID_FILE_PATH: '/var/deeper/config/aos.uuid',
  METRIC_FILE_DIR: '/tmp/',
  METRIC_FILE_SZ: 16 * 1024 * 1024,

  /* IPC */
  IPC_LISTEN_IP: '127.0.0.1',
  DP_IPC_PORT: 9999,
  MP_IPC_PORT: 10000,
  CP_CTRL_PORT: 10001,

  /* nat traversal */
  NAT_NODE_EXPIRE_TIME_MS: 2 * 60 * 1000,
  NAT_CLI_TUNNEL_THRESH: 10,
  NAT_SRV_TUNNEL_THRESH: 30,
  NAT_BROADCAST_INTERVAL: 60 * 1000,

  /* deeper chain related */
  API_WAIT_TIME: 10000, // in ms
  HACKATHON_URL: [
      'wss://<blockchain_url1>:443',
      'wss://<blockchain_url2>:443',
      'wss://<blockchain_url3>:443',
  ],
  DOCKER_CHAIN_URL: 'ws://172.17.0.6:9944',
  NUM_SERVERS: 50,
  CHANNEL_INITIAL_BALANCE: 100, // inital DPR to open channel
  AIRDROP_AMT: 10000, // airdrop amount, test only
  CHANNEL_EXPIRATION_BLOCKS : 3600, // number of blocks
  POC_DELEGATION_THREAD_INTERVAL: 6 * 1000 * 72 *2 / 3, // 2/3 ERA of deeper chain
  POC_DELEGATION_SCORE_THRESHOLD: 60,
  POC_DELEGATION_MAX_VALIDATORS: 10,
  /* micropayment */
  MICROPAYMENT_BALANCE_LOW_THRESHOD: 10, // when channel balance < 10, client should add balance to channel
  MICROPAYMENT_REFRESH_INTERVAL_MS: 5 * 1000,
  SERVER_TRAFFIC_THREASHOLD: 50 * 1024 * 1024,
  CLIENT_TRAFFIC_THREASHOLD: 5 * 1024 * 1024, // send micropayment every 5 mb
  DATA_TO_DPR_RATIO: 10 / 1024 / 1024, // 1 MB => 10 DPR, need adjustment, for test purpose only

  REGISTER_DURATION: 1, // 1 day

  ROOT_KEY: "0xc5976f94c4964239aeccc1511b12f505a7b04796e5f1d56dc7c0d714930ddd58", // root key is only used in airdrop, for testing purpose only, should be removed in production

  /* misc */
  IP_PUBLISH_TIME_INTERVAL_MS: 60 * 60 * 1000,

  /* IP encrypt key */
  IP_PSK: 'YOUR_IP_ENC_KEY',
};

module.exports = CONFIG;
