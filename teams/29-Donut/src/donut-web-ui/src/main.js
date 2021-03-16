import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import { formatBalance } from './utils/helper'

Vue.config.productionTip = false

Vue.filter('amountForm', formatBalance)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
