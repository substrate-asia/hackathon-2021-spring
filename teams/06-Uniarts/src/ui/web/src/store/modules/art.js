import http from "@/plugins/http";
import rpc from "@/plugins/rpc";
import { BigNumber } from "bignumber.js";
import { ComputeBlockTimestamp } from "@/utils";
import _ from "lodash";

export default {
    namespaced: true,
    state: {
        categories: [],
        themes: [],
        materials: [],

        ART_OFFLINE: 1,
        ART_ONLINE: 2,
        ART_ON_AUCTION: 3,
        ART_WAITING_AUCTION: 4,
        ART_ON_SALE: 5,
        ART_AUCTIONED: 6,

        art: {
            img_detail_file1: {},
            img_detail_file2: {},
            img_detail_file3: {},
            img_detail_file4: {},
            img_detail_file5: {},
        },
        auctionInfo: {},
        auctionList: [],
        saleInfo: {},
        transactionList: [],
        signatureList: [],

        subQueue: [],

        isSending: false,
    },
    mutations: {
        SET_CATEGORIES: (state, data) => {
            state.categories = data.map((v) => {
                v.cate_label = "categories";
                return v;
            });
        },
        SET_THEMES: (state, data) => {
            state.themes = data.map((v) => {
                v.cate_label = "themes";
                return v;
            });
        },
        SET_MATERIALS: (state, data) => {
            state.materials = data.map((v) => {
                v.cate_label = "materials";
                return v;
            });
        },
        SET_IS_SENDING: (state, data) => {
            state.isSending = data;
        },
        SET_AUCTION_INFO: (state, data) => {
            state.auctionInfo = data;
        },
        SET_AUCTION_LIST: (state, list) => {
            state.auctionList = list;
        },
        SET_ART_INFO: (state, info) => {
            state.art = info;
        },
        SET_SALE_INFO: (state, info) => {
            state.saleInfo = info;
        },
        SET_TRANSACTION_LIST: (state, list) => {
            state.transactionList = list;
        },
        SET_SIGNATURE_LIST: (state, list) => {
            state.signatureList = list;
        },
        ADD_SUB_QUEUE: (state, sub) => {
            state.subQueue.push(sub);
        },
        RESET_SUB_QUEUE: (state) => {
            state.subQueue.forEach((v) => {
                v();
            });
        },
        RESET_INFO: (state) => {
            state.subQueue = [];
            state.auctionInfo = {};
            state.auctionList = [];
            state.saleInfo = {};
            state.transactionList = [];
            state.signatureList = [];
        },
    },
    getters: {
        artStatus(state, getters, rootState) {
            if (!state.art.item_id) {
                return state.ART_OFFLINE;
            }
            if (state.auctionInfo.id) {
                let startHeight = state.auctionInfo.start_time;
                let endHeight = state.auctionInfo.end_time;
                let currentHeight = parseInt(
                    rootState.global.chain.blockHeight
                );
                if (new BigNumber(currentHeight).gt(endHeight)) {
                    return state.ART_AUCTIONED;
                } else if (
                    new BigNumber(currentHeight).gte(startHeight) &&
                    new BigNumber(currentHeight).lte(endHeight)
                ) {
                    return state.ART_ON_AUCTION;
                } else {
                    return state.ART_WAITING_AUCTION;
                }
            }
            if (state.saleInfo.item_id) {
                return state.ART_ON_SALE;
            }
            return state.ART_ONLINE;
        },
    },
    actions: {
        GetCategories({ commit }) {
            http.globalGetCategories({}).then((data) => {
                commit("SET_CATEGORIES", data);
            });
        },
        GetThemes({ commit }) {
            http.globalGetThemes({}).then((data) => {
                commit("SET_THEMES", data);
            });
        },
        GetMaterials({ commit }) {
            http.globalGetMaterials({}).then((data) => {
                commit("SET_MATERIALS", data);
            });
        },
        SetCategory({ commit }, data) {
            commit("SET_CATEGORIES", data);
        },
        SetThemes({ commit }, data) {
            commit("SET_THEMES", data);
        },
        SetMaterials({ commit }, data) {
            commit("SET_MATERIALS", data);
        },
        SetAuctionInfo({ commit }, data) {
            commit("SET_AUCTION_INFO", data);
        },
        SetAuctionList({ commit }, list) {
            commit("SET_AUCTION_LIST", list);
        },
        ResetSubQueue({ commit }) {
            commit("RESET_SUB_QUEUE");
        },
        async SendExtrinsic({ commit }, { address, extrinsic, cb, done, err }) {
            commit("SET_IS_SENDING", true);
            commit("RESET_SUB_QUEUE");
            rpc.signAndSend(
                address,
                extrinsic,
                () => {
                    cb();
                },
                () => {
                    commit("SET_IS_SENDING", false);
                    done();
                },
                () => {
                    commit("SET_IS_SENDING", false);
                    err();
                }
            );
        },
        // async QueryStorage({ state, commit }, { query, args = [] }) {
        //     if (state.isSending) {
        //         let result = await query(...args);
        //         return result;
        //     } else {
        //         let subObject = await query(
        //             ...args,
        //             (result) => {

        //             }
        //         );
        //         commit("ADD_SUB_QUEUE", subObject);
        //         return result;
        //     }
        // },
        ResetInfo({ commit }) {
            commit("RESET_INFO");
        },
        async SetArtInfo({ commit }, info) {
            commit("SET_ART_INFO", info);
        },
        async GetSaleInfo({ state, commit }) {
            if (!state.art.collection_id) return;
            await rpc.api.isReady;
            if (state.isSending) {
                let result = await rpc.api.query.nft.saleOrderList(
                    state.art.collection_id,
                    state.art.item_id
                );
                commit("SET_SALE_INFO", result.isEmpty ? {} : result.toJSON());
            } else {
                let subObject = await rpc.api.query.nft.saleOrderList(
                    state.art.collection_id,
                    state.art.item_id,
                    (result) => {
                        console.log(result.isEmpty ? {} : result.toJSON());
                        commit(
                            "SET_SALE_INFO",
                            result.isEmpty ? {} : result.toJSON()
                        );
                    }
                );
                commit("ADD_SUB_QUEUE", subObject);
            }
        },
        async GetAuctionInfo({ dispatch, state, commit }) {
            if (!state.art.collection_id) return;
            await rpc.api.isReady;
            if (state.isSending) {
                let result = await rpc.api.query.nft.auctionList(
                    state.art.collection_id,
                    state.art.item_id
                );
                commit(
                    "SET_AUCTION_INFO",
                    result.isEmpty ? {} : result.toJSON()
                );
                dispatch("GetAuctionList");
            } else {
                let dispatchGetAuctionList = _.once(() => {
                    console.log(1);
                    dispatch("GetAuctionList");
                });
                let subObject = await rpc.api.query.nft.auctionList(
                    state.art.collection_id,
                    state.art.item_id,
                    (result) => {
                        console.log(result.isEmpty ? {} : result.toJSON());
                        commit(
                            "SET_AUCTION_INFO",
                            result.isEmpty ? {} : result.toJSON()
                        );
                        dispatchGetAuctionList();
                    }
                );
                commit("ADD_SUB_QUEUE", subObject);
            }
        },
        async GetAuctionList({ state, commit }) {
            if (!state.auctionInfo.id) return;
            await rpc.api.isReady;
            if (state.isSending) {
                let result = await rpc.api.query.nft.bidHistoryList(
                    state.auctionInfo.id
                );
                commit(
                    "SET_AUCTION_LIST",
                    result.isEmpty ? [] : result.toJSON().reverse()
                );
            } else {
                let subObject = await rpc.api.query.nft.bidHistoryList(
                    state.auctionInfo.id,
                    (result) => {
                        commit(
                            "SET_AUCTION_LIST",
                            result.isEmpty ? [] : result.toJSON().reverse()
                        );
                    }
                );
                commit("ADD_SUB_QUEUE", subObject);
            }
        },
        async GetTransactionList({ state, commit, rootState }) {
            if (!state.art.collection_id) return;
            await rpc.api.isReady;
            let subObject = await rpc.api.query.nft.historySaleOrderList(
                state.art.collection_id,
                state.art.item_id,
                (result) => {
                    console.log(result.toJSON());
                    let list = result.isEmpty ? [] : result.toJSON().reverse();
                    list.map((v) => {
                        v.sign_timestamp = ComputeBlockTimestamp(
                            v.buy_time,
                            rootState.global.chain.timestamp,
                            rootState.global.chain.blockHeight
                        );
                        return v;
                    });
                    commit("SET_TRANSACTION_LIST", list);
                }
            );
            commit("ADD_SUB_QUEUE", subObject);
        },
        async GetSignatureList({ state, commit, rootState }) {
            if (!state.art.collection_id) return;
            await rpc.api.isReady;
            let subObject = await rpc.api.query.nft.signatureList(
                state.art.collection_id,
                state.art.item_id,
                (result) => {
                    let list = result.isEmpty ? [] : result.toJSON().reverse();
                    list.map((v) => {
                        v.sign_timestamp = ComputeBlockTimestamp(
                            v.sign_time,
                            rootState.global.chain.timestamp,
                            rootState.global.chain.blockHeight
                        );
                        return v;
                    });
                    commit("SET_SIGNATURE_LIST", list);
                }
            );
            commit("ADD_SUB_QUEUE", subObject);
        },
    },
};
