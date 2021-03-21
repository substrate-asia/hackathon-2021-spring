import axios from "@/plugins/axios";
import crypto from "crypto";
import axiosInstance from "@/plugins/router";
import { getLocalStore } from "@/plugins/storage";
import store from "@/store";
import { HTTP_DEFAULT_CONFIG } from "@/config";

function _isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export function requestSuccessFunc(config) {
    // 自定义请求拦截逻辑，可以处理权限，请求发送监控等
    const method = config.method.toUpperCase();

    let tokenObj = JSON.parse(getLocalStore("user_token") || "{}");

    if (!tokenObj.token) tokenObj = false;
    if (config.signature) {
        tokenObj = config.signature;
    }
    if (!config.unSignature && tokenObj) {
        let url =
            (config.baseURL.replace("/test/api/", "/api/") ||
                HTTP_DEFAULT_CONFIG.baseURL) + config.url;
        let queryStr = "";
        let tonce = Date.parse(new Date()) / 1000;
        if (method === "GET" || method === "DELETE") {
            const params = {
                tonce,
                ...config.params,
            };
            let keys = Object.keys(params);
            let keysArray = keys.sort();
            keysArray.forEach((v) => {
                queryStr += v + "=" + params[v] + "&";
            });
        } else {
            const params = {
                tonce,
                ...config.paramsObj,
            };
            let keys = Object.keys(params).sort();
            keys.forEach((v) => {
                let temp = "";
                if (Array.isArray(params[v])) {
                    temp = params[v][1];
                } else {
                    temp = params[v];
                }
                queryStr += v + "=" + temp + "&";
            });
        }
        queryStr = queryStr.substr(0, queryStr.length - 1);
        config.headers["Authorization"] = tokenObj.token;
        config.headers["Tonce"] = tonce;
        config.headers["Sign"] = _getHmacSHA256(
            method,
            url,
            queryStr,
            tokenObj.expire_at
        );
    }
    let languageStr = "en";
    // switch (store.state.global.language) {
    //     case "jap":
    //         languageStr = "ja-JP";
    //         break;
    //     case "kor":
    //         languageStr = "ko";
    //         break;
    //     default:
    //         languageStr = store.state.global.language;
    // }
    config.headers["Accept-Language"] = languageStr;
    return config;
}

export function requestFailFunc(requestError) {
    return Promise.reject(requestError.data);
}

export function responseSuccessFunc(responseObj) {
    if (
        responseObj.data.head.total_count === 0 ||
        responseObj.data.head.total_count
    ) {
        return Promise.resolve({
            total_count: responseObj.data.head.total_count,
            list: responseObj.data.body,
        });
    }
    return Promise.resolve(responseObj.data.body);
}

export function responseFailFunc(responseError) {
    if (responseError.response) {
        if (responseError.response.status == 400) {
            let errorHead = responseError.response.data.head;
            if (errorHead.code == 1070) {
                store.dispatch("user/Quit");
                axiosInstance.push("/login");
            }
            return Promise.reject(responseError.response.data);
        }
        if (responseError.response.status == 404) {
            return Promise.reject(responseError.response.data);
        }
        if (responseError.response.status == 503) {
            return Promise.reject(responseError.response.data);
        }
        if (responseError.response.status >= 500) {
            return Promise.reject({
                head: {
                    code: 9999,
                    msg: "Server unknown error, please try again later",
                    detail: "",
                },
            });
        }
        return Promise.reject(responseError.response.data);
    } else {
        if (
            responseError.code === "ECONNABORTED" &&
            responseError.config.method === "get"
        ) {
            // 请求超时了
            const config = responseError.config;
            // 配置不存在或者未设置retry属性
            if (!config || !config.retry) return Promise.reject(responseError);

            // 设置已经重新请求次数的变量以便下次判断
            config.__retryCount = config.__retryCount || 0;

            // 检查再次请求次数是否超过设定
            if (config.__retryCount >= config.retry) {
                // 超时次数超过设定
                console.log("Request timed out, retried many times");
                return Promise.reject(responseError);
            }

            // 增加再次请求计数
            config.__retryCount += 1;

            // 创建promise延时处理再次请求
            const backoff = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, config.retryDelay || 1);
            });

            // 返回一个其中包含了再次请求的promise，
            return backoff.then(function () {
                // url会因为baseURL不停的叠加
                config.url = config.url.replace(config.baseURL, "");
                if (_isJSON(config.data)) {
                    // axios默认会把data JSON化，重新请求时会导致签名算法读取的是字符串，导致出错
                    config.data = JSON.parse(config.data);
                }
                return axios(config);
            });
        }
        return Promise.reject(responseError);
    }
}

// 签名算法
function _getHmacSHA256(method, url, fields, expire_at) {
    let message = method + "|" + url + "|" + fields;
    console.log(message);
    let str = crypto
        .createHmac("sha256", expire_at)
        .update(message)
        .digest("hex");
    return str;
}
