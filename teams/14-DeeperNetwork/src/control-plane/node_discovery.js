'use strict';

const log = require('../common-js/log');
const chain = require('./chain');

async function getServersFromBlockchain(rgn) {
  let ips = await chain.getServersByRegion(rgn);
  if (ips === null) {
    log.error('failed to get ip from blockchain');
    return {};
  }
  log.info(`get IPs from blockchain: ${JSON.stringify(ips)}`);
  return ips;
}

exports.getServers = async function (rgn) {
  let ips = await getServersFromBlockchain(rgn);
  return ips;
};
