'use strict';

const dp = require('../dp');
const logger = require('../../common-js/log');

exports.getActiveNode = async tunnelCode => {
  const ipcMsg = {
    cmd: 'getActiveNode',
    tunnelCode: tunnelCode,
  };

  const response = await dp.sendDpRequest(ipcMsg);

  if (response && response.nodeId) {
    return response.nodeId;
  } else {
    logger.error(`There is no active node for ${tunnelCode}`);
    return null;
  }
};

exports.setActiveNode = async (tunnelCode, countryCode, nodeId) => {
  const ipcMsg = {
    cmd: 'setActiveNode',
    tunnelCode: tunnelCode,
    countryCode: countryCode,
    nodeId: nodeId
  };

  const response = await dp.sendDpRequest(ipcMsg);

  if (response && response.status === 'ok') {
    return true;
  } else {
    logger.error(`Error setting active node: ${JSON.stringify(response)}`);
    return false;
  }
};
