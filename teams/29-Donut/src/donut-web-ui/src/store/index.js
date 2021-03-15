import Vue from 'vue'
import Vuex from 'vuex'
import Cookie from 'vue-cookies'
import {
  vestsToSteem,
  getAccountInfo,
  getSteemBalance,
  getSbdBalance,
  getVestingShares
} from '../utils/chain/steem'

import { getApi } from '../utils/chain/polkadot'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // steem
    steemAccount: Cookie.get('steemAccount'),
    steemBalance: 0,
    vestsBalance: 0,
    sbdBalance: 0,
    vestsToSteem: 0,

    // polkadot
    apiState: null,
    donutAccount: Cookie.get('donutAccount'),
    dnutBalance: 0,
    api:null,
  },
  mutations: {
    // steem
    saveSteemAccount: function (state, steemAccount) {
      state.steemAccount = steemAccount
      Cookie.set('steemAccount', steemAccount, '30d')
    },
    saveSteemBalance: function (state, steemBalance) {
      state.steemBalance = steemBalance
    },
    saveVestsBalance: function (state, vestsBalance) {
      state.vestsBalance = vestsBalance
    },
    saveSbdBalance: function (state, sbdBalance) {
      state.sbdBalance = sbdBalance
    },
    saveVestsToSteem: function (state, vestsToSteem) {
      state.vestsToSteem = vestsToSteem
    },
    clearSteemAccount(state) {
      state.steemAccount = null
      Cookie.remove('steemAccount')
    },

    // polkadot
    saveApiState(state, param){
      console.log('apiState:',param.apiState)
      const { apiState, _api } = param
      state.apiState = apiState
      if (_api) {
        state.api = _api
      }
    },
    saveDonutAccount(state, donutAccount) {
      console.log('save acc',donutAccount);
      state.donutAccount = donutAccount
      Cookie.set('donutAccount', donutAccount, '30d')
    },
    saveDnutBalance(state, dnutBalance){
      state.dnutBalance = dnutBalance
    }
  },
  getters: {
    // steem
    spBalance: state => {
      return state.vestsBalance * state.vestsToSteem || 0
    },
  },
  actions: {
    // steem
    setVestsToSteem({
      commit
    }) {
      vestsToSteem(1).then((res) => {
        commit('saveVestsToSteem', res)
      })
    },

    getSteem({
      commit,
      state
    }) {
      getSteemBalance(state.steemAccount).then((steem) => {
        commit('saveSteemBalance', steem)
      })
    },

    getSbd({
      commit,
      state
    }) {
      getSbdBalance(state.steemAccount).then((sbd) => {
        commit('saveSbdBalance', sbd)
      })
    },

    getVests({
      commit,
      state
    }) {
      getVestingShares(state.steemAccount).then((vests) => {
        commit('saveVestsBalance', vests)
      })
    },

    async initializeSteemAccount({
      commit
    }, steemAccount) {
      try {
        const account = await getAccountInfo(steemAccount)
        const steem = parseFloat(account.balance)
        const sbd = parseFloat(account.sbd_balance)
        const vests = parseFloat(account.vesting_shares) - parseFloat(account.delegated_vesting_shares)
        commit('saveSteemBalance', steem)
        commit('saveSbdBalance', sbd)
        commit('saveVestsBalance', vests)
        commit('saveSteemAccount', steemAccount)
        return true
      } catch (err) {
        // console.error('initializeSteemAccount Fail:', err.message)
        return false
      }
    },

    async saveDonutAccount({commit}, donutAccount) {
      commit('saveDonutAccount',donutAccount)
      // const query = getApi().query
      // console.log('api',getApi().query);
      // console.log('query', query.system);
      // const { nonce, data: balance } = await query.system.account(donutAccount.address);
      // console.log('banlance:', balance);
      // commit('saveDnutBalance', balance.free)
    }
  },
  modules: {}
})
