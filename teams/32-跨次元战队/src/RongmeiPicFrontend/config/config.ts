// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
const { REACT_APP_ENV } = process.env;
export default defineConfig({
  hash: true,
  antd: {},
  base: '/',
  publicPath: '/',
  dva: {
    hmr: true,
  },
  history: {
    type: 'hash',
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['ROLE_USER'],
          routes: [
            {
              path: '/account',
              routes: [
                {
                  name: '个人中心',
                  icon: 'smile',
                  path: '/account/center',
                  component: './account/center',
                  routes: [
                    {
                      name: '交易记录',
                      path: '/account/center/order',
                      component: './account/center/order',
                    },
                    {
                      name: '我的钱包',
                      path: '/account/center/wallet',
                      component: './account/center/wallet',
                    },
                  ],
                },
                {
                  name: '个人设置',
                  icon: 'smile',
                  path: '/account/settings',
                  component: './account/settings',
                },
              ],
            },
            {
              path: '/',
              redirect: '/home',
            },
            {
              path: '/home',
              component: './home',
            },
            // {
            //   path: '/record',
            //   name: '实时动态',
            //   component: './record',
            // },
            {
              path: '/protocol/:type',
              component: './protocol',
            },
            {
              path: 'https://admin.dimension.pub',
              name: '创作者平台',
            },
            {
              path: '/person/:code',
              component: './user',
            },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
