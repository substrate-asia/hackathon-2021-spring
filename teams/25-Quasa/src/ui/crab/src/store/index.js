import Vue from 'vue'
import Vuex from 'vuex'
/*语言包*/
import lang_zh from '../tools/lang_zh.js'
import lang_en from '../tools/lang_en.js'
Vue.use(Vuex)
let state={
  //登录信息，必须初始化
  lang: {cn: lang_zh, en: lang_en},
  languageType: 'cn',
  //菜单
  menu:"0",
}

const mutations = {
  /*
  * 设置state
  * */
  setState(state, params) {
    for (let k in params) {
      state[k] = params[k]
    }
  }
};

export default new Vuex.Store({
  state,mutations,
})
