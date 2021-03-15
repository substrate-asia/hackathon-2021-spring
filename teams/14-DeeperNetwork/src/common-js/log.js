'use strict';

const fs = require('fs');

const config = require('./config');

/* write log to stdout by default */
let debug = true;
let info = true;
let error = true;

let logFile = null;
let logFileOld = null;
let logSize = 0;

process.on('SIGUSR2', () => {
    debug = !debug;
});

function getDate() {
  let date = new Date();

  let hour = date.getHours();
  hour = (hour < 10 ? '0' : '') + hour;

  let min = date.getMinutes();
  min = (min < 10 ? '0' : '') + min;

  let sec = date.getSeconds();
  sec = (sec < 10 ? '0' : '') + sec;

  let year = date.getFullYear();

  let month = date.getMonth() + 1;
  month = (month < 10 ? '0' : '') + month;

  let day = date.getDate();
  day = (day < 10 ? '0' : '') + day;

  return '[' + year + month + day + ',' + hour + ':' + min + ':' + sec + ']';
}

function getFilesize(filename) {
  try {
    let stats = fs.statSync(filename);
    return stats.size;
  } catch (err) {
    return 0;
  }
}

exports.init = function (filename, mode) {
  if (filename) {
    /* get initial file size if it already exists */
    logSize = getFilesize(filename);

    logFile = filename;
    logFileOld = filename + '.old';
  }

  if (mode) {
    debug = false;
    info = false;
    error = false;
    for (let i = 0; i < mode.length; i++) {
      switch (mode[i]) {
        case 'D':
          debug = true;
          break;
        case 'I':
          info = true;
          break;
        case 'E':
          error = true;
          break;
        default:
          break;
      }
    }
  }
};

function checkLogSize() {
  if (!logFile) {
    return;
  }

  if (logSize > config.LOG_FILE_SZ) {
    try {
      fs.renameSync(logFile, logFileOld);
    } catch (err) {
      return;
    }

    /* reset log size */
    logSize = 0;
  }
}

exports.size = function () {
  return logSize;
};

function write(msg) {
  if (logFile) {
    fs.appendFileSync(logFile, msg + '\n');
  }
}

exports.debug = function (msg) {
  if (debug) {
    checkLogSize();
    let str = getDate() + ' DEBUG: ' + msg;
    write(str);
    logSize += str.length;
  }
};

exports.info = function (msg) {
  if (info) {
    checkLogSize();
    let str = getDate() + ' INFO: ' + msg;
    write(str);
    logSize += str.length;
  }
};

exports.error = function (msg) {
  if (error) {
    checkLogSize();
    let str = getDate() + ' ERROR: ' + msg;
    write(str);
    logSize += str.length;
  }
};

function getStackTrace() {
  let obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
}

exports.line = function () {
    let e = new Error();
    let frame = e.stack.split('\n')[2];
    let lineNumber = frame.split(':')[1];
    let functionName = frame.split(' ')[5];
    return ' [' + functionName + ':' + lineNumber + '] ';
}


exports.bt = function (msg) {
  checkLogSize();

  let str;

  if (msg) {
    str = getDate() + ' BT: ' + msg;
  } else {
    str = getDate() + ' BT: ';
  }

  str += getStackTrace();

  write(str);

  logSize += str.length;
};

exports.tmp = function (msg) {
  checkLogSize();

  let str;

  if (msg) {
    str = getDate() + ' TMP: ' + msg;
  } else {
    str = getDate() + ' TMP: ';
  }

  write(str);

  logSize += str.length;
};

