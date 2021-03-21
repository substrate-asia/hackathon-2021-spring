import Axios from "axios";

Axios.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';

export const COMMON_SERVICE = "rongmei.account.api";
export const MALL_SERVICE = "rongmei.mall.api";

function packDev(service) {
    return `${service.split(".").join("_")}_dev`;
}

function packProd(service) {
    return `${service.split(".").join("_")}_prod`;
}

export class DNSService {
    async get(service, params) {
        const currHost = params.hostname;
        let serviceName = service;
        if (currHost.indexOf("dev") >= 0 || currHost.indexOf("rongmeitech.com") >= 0 || currHost.indexOf("http://39.102.36.169") >= 0) {
            serviceName = packDev(service);
        } else if (currHost.indexOf("prod") >= 0 || currHost.indexOf("localhost") >= 0 || currHost.indexOf("dimension.pub") >= 0 || currHost.indexOf("81.70.102.195") >= 0) {
            serviceName = packProd(service);
        }
        try {
            return `https://api.dimension.pub/${serviceName}`;
        } catch (e) {
            throw e;
        }
    }
}

const httpDNS = new DNSService();

export class HttpService {
    service;

    constructor(service) {
        this.service = service;
    }

    async get(path, params) {
        try {
            const _instance = Axios.create({
                baseURL: await httpDNS.get(this.service, params)
            });
            let res = await _instance.get(path, {
                params: params
            });
            if (res.status < 200 || res.status >= 400) {
                throw new Error(`${res.status}`);
            }
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    async post(path, params) {
        try {
            const _instance = Axios.create({
                baseURL: await httpDNS.get(this.service, params)
            });
            let res = await _instance.post(path, params, {});
            if (res.status < 200 || res.status >= 400) {
                throw new Error(`${res.status}`);
            }
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    async put(path, params) {
        try {
            const _instance = Axios.create({
                baseURL: await httpDNS.get(this.service, params)
            });
            let res = await _instance.put(path, params, {});
            if (res.status < 200 || res.status >= 400) {
                throw new Error(`${res.status}`);
            }
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    async delete(path, params) {
        try {
            const _instance = Axios.create({
                baseURL: await httpDNS.get(this.service, params)
            });
            let res = await _instance.delete(path, {});
            if (res.status < 200 || res.status >= 400) {
                throw new Error(`${res.status}`);
            }
            return res.data;
        } catch (e) {
            throw e;
        }
    }
}

export const httpCommon = new HttpService(COMMON_SERVICE);
export const httpMall = new HttpService(MALL_SERVICE);
