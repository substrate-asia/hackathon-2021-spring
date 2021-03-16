/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2021-02-25 13:32:31
 */
import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from '../components/Layout';

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: 'index',
        meta: {
          footerTop: false
        },
        component: () => import(/* webpackChunkName: "index" */ '../views/index/index.vue')
      },
      {
        path: '/myAssets',
        name: 'myAssets',
        component: () => import(/* webpackChunkName: "myAssets" */ '../views/myAssets/index.vue')
      },
      {
        path: '/productDetail/:id',
        name: 'productDetail',
        component: () =>
          import(/* webpackChunkName: "productDetail" */ '../views/productDetail/index.vue')
      },
      {
        path: '/submitOrder/:id',
        name: 'submitOrder',
        component: () =>
          import(/* webpackChunkName: "submitOrder" */ '../views/submitOrder/index.vue')
      },
      {
        path: '/tradingCenter',
        name: 'tradingCenter',
        component: () =>
          import(/* webpackChunkName: "tradingCenter" */ '../views/tradingCenter/index.vue')
      },
      {
        path: '/depositQuery',
        name: 'depositQuery',
        component: () =>
          import(/* webpackChunkName: "depositQuery" */ '../views/depositQuery/index.vue')
      },
      {
        path: '/publishAssets',
        name: 'publishAssets',
        component: () =>
          import(/* webpackChunkName: "publishAssets" */ '../views/publishAssets/index.vue')
      },
      {
        path: '/certification',
        name: 'certification',
        component: () =>
          import(/* webpackChunkName: "certification" */ '../views/certification/index.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
