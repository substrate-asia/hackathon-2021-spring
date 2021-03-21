'use strict';

const superagent = require('superagent');
const to = require('await-to-js').default;
const logger = require('./log');

const geoCache = {};
const thirdPartyGeoApiList = [
  {
    url: 'https://freegeoip.app/json/{ip}',
    convertFunc: convertFreegeoip
  },
  {
    url: 'https://geo.ipify.org/api/v1?apiKey=at_cLwH8G3aa6NwucHs4wgT4bTeV78eH&ipAddress={ip}',
    convertFunc: convertIpify
  },
  {
    url: 'https://ip-geolocation.whoisxmlapi.com/api/v1?apiKey=at_CbkmXTA4JRpFlyDQht1v0H4nFCcyk&ipAddress={ip}',
    convertFunc: convertIpify
  },
  {
    url: 'http://ip-api.com/json/{ip}',
    convertFunc: convertIpapi
  },
];

exports.lookupIp = async function (ip) {
  if (geoCache[ip]) {
    return geoCache[ip];
  }

  // query third party API
  for (const api of thirdPartyGeoApiList) {
    const url = api.url.replace('{ip}', ip);
    const [err, res] = await to(superagent.get(url));

    if (!err && res && res.status === 200) {
      logger.info(`Query result from ${url}: ${res.text}`);
      const originalGeo = JSON.parse(res.text);
      return api.convertFunc(originalGeo);
    }

    logger.error(`Failed to query from ${url}: ${err}`);
  }

  return {};
};

function convertFreegeoip(origin) {
  const geo = {};
  geo.country = origin['country_code'];
  geo.region = origin['region_code'];
  geo.timezone = origin['time_zone'];
  geo.city = origin.city;
  geo.ll = [origin.latitude, origin.longitude];
  geo.metro = origin['metro_code'];
  return geo;
}

function convertIpify(origin) {
  const geo = {};
  geo.country = origin.location.country;
  geo.region = origin.location.region;
  geo.timezone = origin.location.timezone;
  geo.city = origin.location.city;
  geo.ll = [origin.location.lat, origin.location.lng];
  return geo;
}

function convertIpapi(origin) {
  const geo = {};
  geo.country = origin.countryCode;
  geo.region = origin.region;
  geo.timezone = origin.timezone;
  geo.city = origin.city;
  geo.ll = [origin.lat, origin.lon];
  return geo;
}
