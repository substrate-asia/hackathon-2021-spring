/*
 * @Description: api定义
 * @Author: 龙春雨
 * @Date: 2021-03-08 15:57:51
 */
import request from '@/axios';
// 注册或者登录
export const loginOrRegister = data => {
  return request({
    url: '/user/login',
    method: 'post',
    data
  });
};

// 提交新资产
export const addAssets = data => {
  return request({
    url: '/assets/add',
    method: 'post',
    data
  });
};

// // 获取资产分类
// export const getCategoryList = () => {
//   return request({
//     url: '/category/list',
//     method: 'get'
//   });
// };

// 获取我发布的资产
export const getMyAssetsList = params => {
  return request({
    url: '/user/assets',
    method: 'get',
    params
  });
};

// 获取交易中心列表
export const getAssetsList = params => {
  return request({
    url: '/assets/list',
    method: 'get',
    params
  });
};

// 获取我购买的的资产
export const getOrderList = params => {
  return request({
    url: '/user/orders',
    method: 'get',
    params
  });
};

// 资产详情
export const getAssetsDetail = id => {
  return request({
    url: '/assets/detail',
    method: 'get',
    params: {
      id
    }
  });
};

// 更新资产存证或合约相关信息
/**
 *
 * @param {Object} data
 * {
 *  tx_hash: '',
 *  tx_type: 1, // [1-存证、2-NFT创建、3-NFT交易]
 *  assets_id: '' // 资产id}
 */
export const chainNotice = data => {
  return request({
    url: '/chain/notice',
    method: 'post',
    data
  });
};

// 存证查询
export const getProofBook = keyword => {
  return request({
    url: '/common/proof',
    method: 'post',
    params: {
      keyword
    }
  });
};
