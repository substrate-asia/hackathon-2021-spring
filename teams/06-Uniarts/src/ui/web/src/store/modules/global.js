export default {
    namespaced: true,
    state: {
        lang: "en",
        chain: {
            genesisHash: "",
            specVersion: "",
            ss58Format: "",
            tokenDecimals: "",
            tokenSymbol: "",
            blockHeight: "",
            timestamp: "",
        },
    },
    mutations: {
        SET_CHAIN(state, data) {
            state.chain = data;
        },
    },
    actions: {
        SetChain({ commit }, data) {
            commit("SET_CHAIN", data);
        },
    },
};
