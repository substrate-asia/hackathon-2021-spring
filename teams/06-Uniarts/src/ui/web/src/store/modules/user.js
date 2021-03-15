import {
    setLocalStore,
    getLocalStore,
    removeLocalStore,
} from "@/plugins/storage";
import http from "@/plugins/http";

export default {
    namespaced: true,
    state: {
        accounts: [],
        info: Object.assign(
            {},
            JSON.parse(
                getLocalStore("user_token") ||
                    '{ "token": "", "expire_at": "", "address": "" }'
            )
        ),
    },
    mutations: {
        SET_INFO(state, info) {
            state.info = info;
        },
    },
    actions: {
        GetInfo({ commit }) {
            http.userGetInfo({}).then((info) => {
                let tokens = {
                    token: info.token,
                    expire_at: info.expire_at,
                    address: info.address,
                };
                setLocalStore("user_token", tokens);
                commit("SET_INFO", info);
            });
        },
        SetInfo({ commit }, info) {
            let tokens = {
                token: info.token,
                expire_at: info.expire_at,
                address: info.address,
            };
            setLocalStore("user_token", tokens);
            commit("SET_INFO", info);
        },
        Quit({ commit }) {
            removeLocalStore("user_token");
            commit("SET_INFO", {
                token: "",
                expire_at: "",
                address: "",
            });
        },
    },
};
