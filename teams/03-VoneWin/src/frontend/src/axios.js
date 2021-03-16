/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2020-04-14 14:01:22
 */

/* eslint-disable */
import axios from 'axios';
import { serialize } from '@/util/util';
import { getStore, setStore } from '@/util/store';
import NProgress from 'nprogress'; // progress bar
import errorCode from '@/errorCode';
import { ElMessage } from 'element-plus';
import 'nprogress/nprogress.css';
import qs from 'qs';
// import store from '@/store/index'; // progress bar style
axios.defaults.timeout = 300000;
axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? '' : process.env.VUE_APP_BASE_URL;
// 返回其他状态吗
let version = 'v2';
axios.defaults.validateStatus = function(status) {
  return status >= 200 && status <= 500; // 默认的
};
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true;
// NProgress Configuration
NProgress.configure({
  showSpinner: false
});
// HTTPrequest拦截
axios.interceptors.request.use(
  config => {
    NProgress.start(); // start progress bar
    // const isToken = (config.headers || {}).isToken === false;
    const token = getStore({ name: 'api_token' });
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token; // token
    }
    // if (config.headers.header !== false) {
    //   if (token && !isToken) {
    //     config.headers['Authorization'] = 'Bearer ' + token; // token
    //   }
    //   if (config.headers['Authorization'] === 'Bearer ') {
    //     config.headers['Authorization'] = '';
    //   }
    // }
    // config.url = '/api' + config.url;
    // 设置本地语言
    // let locale = getLocale();
    // config.headers['Locale'] = getLocale();
    // if (locale === 'en') {
    //   config.headers['Accept-Language'] = 'en;q=0.8;zh-CN,zh;q=0.9';
    // } else {
    //   config.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    // }
    // if (config.url.indexOf('/platform') !== 0 && !config.headers.noPreffix) {
    //   config.url = '/tenant' + config.url;
    // }
    // #TODO 本地联调，暂时注释掉
    config.url = `/api/${version}${config.url}`;
    // if (process.env.NODE_ENV === 'development') {
    //   config.url = '/api' + config.url;
    // }

    // ie存在接口缓存，接口加上时间辍
    if (!config.params) {
      config.params = {};
    }

    // 分页统一调整
    if (config.method === 'get') {
      config.paramsSerializer = function(params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      };
      config.params.cacheTime = new Date().getTime();
      if (config.params && config.params.currentPage) {
        config.params.current = config.params.currentPage;
        config.params.size = config.params.pageSize;
        delete config.params.currentPage;
        delete config.params.pageSize;
        delete config.params.total;
      }
    } else {
      config.data = config.data || {};
      config.data.user_id = getStore({ name: 'userId' });
    }
    // headers中配置serialize为true开启序列化
    if (config.method === 'post' && config.headers.serialize) {
      config.data = serialize(config.data);
      delete config.data.serialize;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// HTTPresponse拦截
axios.interceptors.response.use(
  res => {
    NProgress.done();
    const status = Number(res.status) || 200;
    const message = res.data.msg || errorCode[status] || errorCode['default'];
    // 如果当前为401，且未在进行401提示时，才能再次进行提示
    // code =1 表示失败，出错误提示，0表示成功，非0非1则是警告提示
    if (status !== 200 || (typeof res.data.errcode !== 'undefined' && res.data.errcode !== 0)) {
      if (status == 500) {
        // 500为内部服务错误， 不进行错误提示，因为提示出来的用户无法理解
        ElMessage({
          message: '服务错误，请重试或联系系统管理员！',
          type: 'error'
        });
      } else if (res.data.errcode === 2) {
        // 登录超时
        ElMessage({
          message: '登录超时，正在重新登录中!',
          type: 'error'
        });
        setTimeout(() => {
          setStore({ name: 'api_token', content: '' });
          setStore({ name: 'userId', content: '' });
          window.location.reload();
        }, 1000);
      } else {
        ElMessage({
          message: message,
          type: 'error'
        });
        return Promise.reject(new Error(message));
      }
    } else return res.data.data;
  },
  error => {
    NProgress.done();
    return Promise.reject(new Error(error));
  }
);

export default axios;

/* eslint-disable */
