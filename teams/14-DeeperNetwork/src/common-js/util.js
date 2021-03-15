"use strict";

const crypto = require("crypto");
const ipRegex = require("ip-regex");
const childProcess = require("child_process");
const log = require("./log");

const randomStringLength = 16;

let isIPv4 = (exports.isIPv4 = function (ip) {
  return ipRegex.v4({ exact: true }).test(ip);
});

let isLAN = (exports.isLAN = function (ip) {
  ip = ip.toLowerCase();
  if (ip === "localhost") {
    return true;
  }

  /* make sure it's ipv4 */
  if (!isIPv4(ip)) {
    return false;
  }

  let aNum = ip.split(".");
  let aIP = 0;
  aIP += parseInt(aNum[0]) << 24;
  aIP += parseInt(aNum[1]) << 16;
  aIP += parseInt(aNum[2]) << 8;
  aIP += parseInt(aNum[3]) << 0;
  aIP = (aIP >> 16) & 0xffff;
  return (
    aIP >> 8 === 0x7f ||
    aIP >> 8 === 0xa ||
    aIP === 0xc0a8 ||
    (aIP >= 0xac10 && aIP <= 0xac1f)
  );
});

exports.isPublicIP = function (ip) {
  return isIPv4(ip) && !isLAN(ip);
};

function getRandomString() {
  return crypto.randomBytes(randomStringLength / 2).toString("hex");
}

exports.getRandomString = getRandomString;

exports.newRequestId = function (pubKey) {
  let requestObj;
  if (pubKey) {
    // json string need less than 128 bytes (defined by IPC_REQ_ID_SZ)
    requestObj = { rand: getRandomString(), pubKey: pubKey };
  } else {
    requestObj = {
      rand: new Date().getTime() + getRandomString(),
    };
  }
  return JSON.stringify(requestObj);
};

exports.promiseWithErrorOnTimeout = (promise, ms) => {
  return exports.promiseWithTimeout(promise, ms, (resolve, reject) => {
    reject(new Error('Operation timed out after ' + ms + ' ms'));
  });
};

exports.promiseWithTimeout = (promise, ms, onTimeout) => {
  let timer = null;

  const timedPromise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      onTimeout(resolve, reject);
    }, ms);
  });

  return Promise.race([
    promise,
    timedPromise,
  ]).finally(() => {
    clearTimeout(timer);
  });
};

exports.shuffle = (array) => {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

exports.parseJSONSafely = function (str) {
  try {
    return JSON.parse(str);
  }
  catch (e) {
    log.error(e);
    return {};
  }
}

