/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2021-02-25 13:32:31
 */
import 'babel-polyfill';
import 'classlist-polyfill';
import { createApp } from 'vue';
// import axios from '@/axios';
import App from './App';
import router from './router';
import store from './store';
import { loadStyle } from '@/util/index';
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import '@/assets/css/element-theme/base.css';
import '@/assets/css/element-theme/input.css';
import '@/assets/css/element-theme/icon.css';
import '@/assets/css/element-theme/select.css';
import '@/assets/css/element-theme/table.css';
import '@/assets/css/element-theme/table-column.css';
import '@/assets/css/element-theme/card.css';
import '@/assets/css/element-theme/tag.css';
import '@/assets/css/element-theme/option.css';
import '@/assets/css/element-theme/button.css';
import '@/assets/css/element-theme/image.css';
import '@/assets/css/element-theme/dialog.css';
import '@/assets/css/element-theme/carousel.css';
import '@/assets/css/element-theme/carousel-item.css';
const iconfontUrl = '//at.alicdn.com/t/font_$key.css';
const iconfontVersion = ['2382926_tdwlc01atr'];
// 动态加载阿里云字体库
iconfontVersion.forEach(ele => {
  loadStyle(iconfontUrl.replace('$key', ele));
});
const app = createApp(App);
const win = window; //
if (process.env.NODE_ENV === 'development') {
  if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in win) {
    // 这里__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue赋值一个createApp实例
    win.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}
app.config.globalProperties.uploadApi = '/api/v2/assets/upload';
app.use(store).use(router);
app.use(ElementPlus);
app.mount('#app');
