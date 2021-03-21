'use strict';

const env = require('./env');
const dp = require('./dp');
const system = require('./system');
const region = require('../common-js/region');
const log = require('../common-js/log');
const activeNode = require('./libs/activeNode');
const nodeDiscovery = require('./node_discovery');

const maxNumOfTunnelsPerRegion = 8;

/**
 * tunnels:
 * {
 *   tunId:
 *   {
 *     pubKey: public key,
 *     ip: remote ip,
 *     port: remote port,
 *     country: country of remote ip,
 *     rgn: rgn key of this tunnel,
 *     req: is req tunnel,
 *     nat: is nat tunnel,
 *   }
 * }
 */

class Tunnel {
  constructor() {
    // The following 4 maps should be accessed through function getTunnels()
    this.cliDataTunnels = {};
    this.cliCtrlTunnels = {};
    this.srvDataTunnels = {};
    this.srvCtrlTunnels = {};

    /* set of regions received from mp */
    this.listTunRegions = new Set();
  }

  getTunnels(ctrl, cli) {
    let tunnels;
    if (cli) {
      if (ctrl) {
        tunnels = this.cliCtrlTunnels;
      } else {
        tunnels = this.cliDataTunnels;
      }
    } else {
      if (ctrl) {
        tunnels = this.srvCtrlTunnels;
      } else {
        tunnels = this.srvDataTunnels;
      }
    }
    return tunnels;
  }

  getRegions() {
    return this.listTunRegions;
  }

  async addTunnel(tunId, pubKey, ip, port, country, ctrl, cli, req, nat) {
    let rgn;
    if (!ctrl && cli) {
      rgn = this._findRgn(country);
      if (!rgn) {
        log.error(`addTunnel: find rgn for ${country} failed`);
        /* ignore this tunnel */
        return;
      }
    } else {
      /* do not care */
      rgn = 'ZZ';
    }

    log.info(`add tunnel ${tunId}, pubKey: ${pubKey},  ${ip}:${port}, country ${country}, rgn ${rgn}, ctrl:${ctrl}, cli:${cli}, req:${req}, nat:${nat}`);

    let tunnels = this.getTunnels(ctrl, cli);
    if (!tunnels[tunId]) {
      tunnels[tunId] = {}; //new object
    }

    tunnels[tunId].pubKey = pubKey;
    tunnels[tunId].ip = ip;
    tunnels[tunId].port = port;
    tunnels[tunId].country = country;
    tunnels[tunId].rgn = rgn;
    tunnels[tunId].req = req;
    tunnels[tunId].nat = nat;
  }

  delTunnel(tunId, ctrl, cli) {
    let tunnels = this.getTunnels(ctrl, cli);
    if (tunnels[tunId]) {
      log.info(`delete tunnel ${tunId}, ${tunnels[tunId].ip}:${tunnels[tunId].port}, country ${tunnels[tunId].country}, rgn ${tunnels[tunId].rgn}, ctrl:${ctrl}, cli:${cli}, req:${tunnels[tunId].req}, nat:${tunnels[tunId].nat}`);
      delete tunnels[tunId];
    } else {
      log.error(`delTunnel: could not find tunId:${tunId} ctrl:${ctrl} cli:${cli}`);
    }
  }

  hasTunnel(ip, ctrl, cli) {
    let tunnels = this.getTunnels(ctrl, cli);
    for (let tunId in tunnels) {
      if (tunnels[tunId].ip === ip) {
        return true;
      }
    }
    return false;
  }

  async setupTunnel(pubKey, ip, port, country, ctrl, cli) {
    /* avoid duplicate tunnels */
    if (this.hasTunnel(ip, ctrl, cli)) {
      log.info(`already have tunnel to ${ip}, country ${country}`);
      return true;
    }

    let ret = await dp.setupTunnel(pubKey, ip, port, country, ctrl, cli);
    if (!ret) {
      log.error(`setup tunnel ${ip}:${port}/${country} failed`);
      return false;
    }

    log.info(`setup tunnel ${ip}:${port}/${country} success`);
    return true;
  }

  async refreshTunnels(ctrl, cli) {
    let tunnels = this.getTunnels(ctrl, cli);
    for (let tunId in tunnels) {
      let status = await dp.getTunStatus(tunId);
      if (status && status !== 'valid') {
        this.delTunnel(tunId, ctrl, cli);
      }
    }
  }

  getTunnelNum(ctrl, cli, req, nat) {
    let num = 0;
    let tunnels = this.getTunnels(ctrl, cli);
    for (let tunId in tunnels) {
      if (tunnels[tunId].req === req && tunnels[tunId].nat === nat) {
        ++num;
      }
    }
    return num;
  }

  getTunnelNumByRegion(rgn, ctrl, cli) {
    let num = 0;
    let tunnels = this.getTunnels(ctrl, cli);
    for (let tunId in tunnels) {
      if (tunnels[tunId].rgn === rgn) {
        ++num;
      }
    }
    return num;
  }

  async getActiveIpByRegion(tunnelCode) {
    const nodeId = await activeNode.getActiveNode(tunnelCode);

    if (nodeId) {
      const clientDataTunnels = this.getTunnels(false, true);
      const tunnel = clientDataTunnels[nodeId];

      if (!tunnel) {
        log.error(`No client data tunnel found with ID ${nodeId} for ${tunnelCode}`);
      }

      return tunnel && tunnel.ip;
    } else {
      return null;
    }
  }

  async setupCliDataTunnels(rgn) {
    log.info(`try forward connect to ${rgn}`);
    await this._forwardConnect(rgn);
  }

  async addRegion(rgn) {
    this.listTunRegions.add(rgn);
    return true;
  }

  async deleteRegion(rgn) {
    if (!this.listTunRegions.has(rgn)) {
      return false;
    }

    this.listTunRegions.delete(rgn);

    /* delete all cli data tunnels of this rgn */
    let ctrl = 0, cli = 1;
    let tunnels = this.getTunnels(ctrl, cli);
    for (let tunId in tunnels) {
      if (tunnels[tunId].rgn === rgn) {
        await this._teardownTunnel(tunId, ctrl, cli);
      }
    }

    return true;
  }

  async clearCliDataTunnels() {
    /* delete all cli data tunnels whose rgn does not exist */
    let ctrl = 0, cli = 1;
    let tunnels = this.getTunnels(ctrl, cli);
    for (let tunId in tunnels) {
      if (!this.listTunRegions.has(tunnels[tunId].rgn)) {
        await this._teardownTunnel(tunId, ctrl, cli);
      }
    }
  }

  async _forwardConnect(rgn) {
    let ips = await nodeDiscovery.getServers(rgn);
    if (!ips || Object.keys(ips).length === 0) {
      log.error('find no IPs to connect');
      return;
    }

    for (let ip in ips) {
      let port = system.getDstPort();
      let ret = await this.setupTunnel(ips[ip].accountId, ip, port, ips[ip].country, 0, 1);
      if (ret) {
        log.info(`forward connect to ${ip}:${port} with pubkey ${ips[ip].accountId} success`);
      } else {
        log.error(`forward connect to ${ip}:${port} with pubkey ${ips[ip].accountId} failed`);
      }

      const currentNum = this.getTunnelNumByRegion(rgn, false, true);
      if (currentNum >= maxNumOfTunnelsPerRegion) {
        break;
      }
    }
  }

  _findRgn(country) {
    if (!region.isValidCountry(country)) {
      return null;
    }

    let path = region.resolveRgnPath(country);
    if (!path) {
      return null;
    }

    for (let i = path.length - 1; i >= 0; --i) {
      if (this.listTunRegions.has(path[i])) {
        return path[i];
      }
    }

    return country;
  }

  async _teardownTunnel(tunId, ctrl, cli) {
    let tunnels = this.getTunnels(ctrl, cli);
    if (!tunnels[tunId]) {
      return true;
    }

    this.delTunnel(tunId, ctrl, cli);
    let ret = await dp.teardownTunnel(tunId);
    return ret;
  }

  async switchNode(tunnelCode, currentIp) {
    const tunnelList = [];
    const clientDataTunnels = this.getTunnels(false, true);

    for (const [nodeId, tunnel] of Object.entries(clientDataTunnels)) {
      if (tunnel.rgn === tunnelCode) {
        const tunnelCopy = { ...tunnel };
        tunnelCopy.nodeId = nodeId;
        tunnelList.push(tunnelCopy);
      }
    }

    if (tunnelList.length <= 1) {
      log.error('one tunnel or less, no node to switch to');
      return {
        activeIp: currentIp,
        activeNum: tunnelList.length
      };
    }

    let currentIndex = 0;
    for (let i = 0; i < tunnelList.length; i++) {
      if (tunnelList[i].ip === currentIp) {
        currentIndex = i;
        break;
      }
    }

    const nextIndex = (currentIndex + 1) % tunnelList.length;
    const data = {
      activeNum: tunnelList.length
    };

    const success = await activeNode.setActiveNode(tunnelCode, tunnelList[nextIndex].country, tunnelList[nextIndex].nodeId);

    if (success) {
      data.activeIp = tunnelList[nextIndex].ip;
    } else {
      data.activeIp = currentIp;
    }

    return data;
  }

  async tearDownUnknownTunnels() {
    const clientDataTunnels = this.getTunnels(false, true);

    for (const tunnelCode of this.listTunRegions) {
      const nodeId = await activeNode.getActiveNode(tunnelCode);

      if (nodeId && !clientDataTunnels[nodeId]) {
        log.info(`${tunnelCode} tunnel with ID ${nodeId} is unknown to CP, tearing down...`);
        await dp.teardownTunnel(nodeId);
      }
    }
  }

  async sendJson(ctrl, cli, tunIdx, jsonStr) {
    let ret = await dp.natMap();
    if (!ret) {
      log.error('get nat map error');
      return false;
    } else {
      log.debug(`get nat map ok, ${ret.localIP}:${ret.localPort} => ${ret.pubIP}:${ret.pubPort}`);
    }

    const tunnels = this.getTunnels(ctrl, cli);
    if (tunIdx in tunnels) {
      let cmdStr = 'tunSendJson';
      let ipcMsg = {
        cmd: cmdStr,
        nodeId: tunIdx,
        jsonPayload: jsonStr,
      };
      const res = await dp.sendDpRequest(ipcMsg);
      if (!res) {
        return false;
      } else if (res.status !== 'ok') {
        log.error(`${cmdStr} status is not ok, it is ${res.status}`);
        return false;
      }
      return true;
    }
    return false;
  }
}

/* export a single global tunnel class object */
module.exports = new Tunnel();
