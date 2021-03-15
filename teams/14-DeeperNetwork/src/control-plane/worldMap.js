'use strict';

const env = require('./env');
const tunnel = require('./tunnel');
const ipLookup = require('../common-js/ip-lookup');
const log = require('../common-js/log');

exports.getWorldMapData = async function () {
  const selfIp = env.getPubIP();
  if (!selfIp) {
    log.error('Self IP not available, return empty data');
    return {};
  }

  const selfGeoInfo = await getGeoInfo(selfIp);
  if (!selfGeoInfo) {
    log.error(`Geo info not available for self IP ${selfIp}, return empty data`);
    return {};
  }

  const mapData = {
    self: selfGeoInfo,
    peerList: []
  };
  await addConnections(tunnel.getTunnels(false, true), mapData.peerList, false);
  await addConnections(tunnel.getTunnels(false, false), mapData.peerList, true);

  return mapData;
};

async function getGeoInfo(ip) {
  const geoInfo = await ipLookup.lookupIp(ip);
  if (geoInfo && geoInfo.ll) {
    return {
      city: geoInfo.city || geoInfo.timezone || geoInfo.country,
      coordinates: geoInfo.ll,
    };
  } else {
    return null;
  }
}

async function addConnections(tunnels, peerList, reversed) {
  for (const tunnelId in tunnels) {
    if (tunnels[tunnelId] && tunnels[tunnelId].ip) {
      const peerIp = tunnels[tunnelId].ip;
      const peerGeoInfo = await getGeoInfo(peerIp);

      if (!peerGeoInfo) {
        log.error(`Geo info not available for peer IP ${peerIp}, skip`);
      } else {
        peerGeoInfo.reversed = reversed;
        peerList.push(peerGeoInfo);
      }
    }
  }
}
