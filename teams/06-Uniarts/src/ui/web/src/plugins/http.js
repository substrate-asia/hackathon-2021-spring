import axios from "@/plugins/axios";
import _assign from "lodash/assign";
import API from "@/api/index";

import { assert } from "@polkadot/util";
import { HTTP_DEFAULT_CONFIG } from "@/config";

function _normoalize(options, data) {
    if (options.method === "POST") {
        options.data = data;
    } else if (options.method === "GET" || options.method === "DELETE") {
        options.params = data;
    }
    return options;
}

function _firstUpperCase(str) {
    return str.replace(/\b(\w)/g, function ($1) {
        return $1.toUpperCase();
    });
}

export class MakeApi {
    request;

    constructor(options) {
        this.request = {};
        this.builder(options);
    }
    builder(options) {
        Object.keys(options.apiModules).forEach((namespace) => {
            this.apiBuilder({
                api: options.apiModules[namespace],
                namespace,
                config: options.config,
            });
        });
    }
    apiBuilder(options) {
        options.api.forEach((api) => {
            const apiName = `${options.namespace}${_firstUpperCase(api.name)}`;
            const url = api.path;
            api.baseURL = api.baseURL ? api.baseURL : options.config.baseURL;
            api.baseURL = options.config.isProd
                ? api.baseURL
                : `/test${api.baseURL}`;
            options.config.debug &&
                assert(api.name, `${url} :接口name属性不能为空`);
            options.config.debug &&
                assert(
                    url.indexOf("/") === 0,
                    `${url} :接口路径path，首字符应为/`
                );
            Object.defineProperty(this.request, apiName, {
                value(outerParams, outerOptions) {
                    let _data = outerParams;
                    if (api.method == "POST") {
                        if (api.options && !api.options.unSignature) {
                            api.options.paramsObj = outerParams;
                        }
                        const formData = new FormData();
                        if (api.options.upload) {
                            Object.keys(outerParams).forEach((v) => {
                                let uploadFile = api.options.upload.find(
                                    (f) => f == v
                                );
                                if (uploadFile && outerParams[v]) {
                                    formData.append(
                                        v,
                                        outerParams[v][0]
                                            ? outerParams[v][0]
                                            : outerParams[v][2],
                                        outerParams[v][1]
                                            ? outerParams[v][1]
                                            : outerParams[v][2]
                                    );
                                } else {
                                    formData.append(v, outerParams[v]);
                                }
                            });
                        } else {
                            Object.keys(outerParams).forEach((v) => {
                                formData.append(v, outerParams[v]);
                            });
                        }
                        _data = formData;
                    }
                    const URL = url.replace(/\{:[a-zA-Z]{1,}\}/g, (match) => {
                        let fieldsName = match.slice(2, match.length - 1);
                        return outerOptions ? outerOptions[fieldsName] : match;
                    });
                    const obj = {
                        url: URL,
                        method: api.method,
                    };
                    api.baseURL && (obj["baseURL"] = api.baseURL);
                    return axios(
                        _normoalize(
                            _assign(
                                obj,
                                _assign({}, api.options, outerOptions)
                            ),
                            _data
                        )
                    );
                },
            });
        });
    }
}

export default new MakeApi({
    apiModules: API,
    config: HTTP_DEFAULT_CONFIG,
}).request;
