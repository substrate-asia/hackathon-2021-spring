/* eslint-disable */
import { validatenull } from './validate';
import request from '@/axios';
// import * as CryptoJS from 'crypto-js';
import { getStore } from '@/util/store';
export const PWD_ENCRYPT_KEY = 'pigxpigxpigxpigx';

// 表单序列化
export const serialize = data => {
  const list = [];

  Object.keys(data).forEach(ele => {
    list.push(`${ele}=${data[ele]}`);
  });
  return list.join('&');
};
export const getObjType = obj => {
  var toString = Object.prototype.toString;
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };

  if (obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
};
/**
 * 对象深拷贝
 */
export const deepClone = data => {
  var type = getObjType(data);
  var obj;

  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    // 不再具有下一层次
    return data;
  }
  if (type === 'array') {
    for (let i = 0, len = data.length; i < len; i++) {
      obj.push(deepClone(data[i]));
    }
  } else if (type === 'object') {
    for (let key in data) {
      obj[key] = deepClone(data[key]);
    }
  }
  return obj;
};
/**
 * 递归寻找子类的父类
 */

export const findParent = (menu, id) => {
  for (let i = 0; i < menu.length; i++) {
    if (menu[i].children.length !== 0) {
      for (let j = 0; j < menu[i].children.length; j++) {
        if (menu[i].children[j].id === id) {
          return menu[i];
        }
        if (menu[i].children[j].children.length !== 0) {
          return findParent(menu[i].children[j].children, id);
        }
      }
    }
  }
};

/**
 * 动态插入css
 */

export const loadStyle = url => {
  const link = document.createElement('link');

  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];

  head.appendChild(link);
};
export const randomLenNum = (len, date) => {
  let random = '';

  random = Math.ceil(Math.random() * 100000000000000)
    .toString()
    .substr(0, len || 4);
  if (date) {
    random = random + Date.now();
  }
  return random;
};
/**
 *  <img> <a> src 处理
 * @returns {PromiseLike<T | never> | Promise<T | never>}
 */
export function handleImg(url, id) {
  return validatenull(url)
    ? null
    : request({
        url: url,
        method: 'get',
        responseType: 'blob'
      }).then(response => {
        // 处理返回的文件流
        const blob = response.data;
        const img = document.getElementById(id);

        img.src = URL.createObjectURL(blob);
        window.setTimeout(function() {
          window.URL.revokeObjectURL(blob);
        }, 0);
      });
}

export function handleDown(filename, bucket) {
  return request({
    url: '/basedata/sys-file/' + bucket + '/' + filename,
    method: 'get',
    responseType: 'blob'
  }).then(response => {
    // 处理返回的文件流
    const blob = response.data;
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(function() {
      URL.revokeObjectURL(blob);
      document.body.removeChild(link);
    }, 0);
  });
}

/**
 * 将QueryString字符串转为Object
 * @param {String} qs
 */
export function queryStringToObj(qs) {
  let result = {};
  let args = qs.split('&');
  for (let arg of args) {
    let keyValueArr = arg.split('=');
    if (keyValueArr && keyValueArr.length === 2) {
      result[keyValueArr[0]] = keyValueArr[1];
    }
  }
  return result;
}

export function getQueryString(url, paraName) {
  const arrObj = url.split('?');

  if (arrObj.length > 1) {
    const arrPara = arrObj[1].split('&');

    let arr;

    for (let i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split('=');
      // eslint-disable-next-line eqeqeq
      if (arr != null && arr[0] == paraName) {
        return arr[1];
      }
    }
    return '';
  }
  return '';
}

/**
 * 深拷贝
 * @param {Object或者Array} source 被拷贝的对象或数组
 */
export const objDeepCopy = source => {
  const result = Array.isArray(source) ? [] : {};

  for (const key in source) {
    if (source[key] != undefined) {
      if (typeof source[key] === 'object') {
        result[key] = objDeepCopy(source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
};
/**
 * 数组去重，json中，可针对固定的标识进行去重
 * @param {*} arr 数组
 * @param {*} key 判断标识
 */

export const unique = (arr2, key) => {
  let arr = objDeepCopy(arr2);
  // var hash = [];

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i][key] === arr[j][key]) {
        arr.splice(j, 1);
        j--;
      }
    }
    // hash.push(arr[i]);
  }
  return arr;
};
