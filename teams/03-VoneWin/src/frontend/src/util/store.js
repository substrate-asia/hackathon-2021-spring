import { validatenull } from '@/util/validate';
// import website from '@/pages/voneadmin/const/website';

const keyName = 'VONEWIN' + '-';
/**
 * 存储localStorage
 */

export const setStore = (params = {}) => {
  let { name, content, type, expiresIn } = params;

  name = keyName + name;
  const obj = {
    dataType: typeof content,
    content: content,
    type: type,
    datetime: new Date().getTime()
  };
  // 有效期，单位秒
  if (expiresIn) {
    obj.expiresIn = expiresIn;
  }

  if (type) {
    window.sessionStorage.setItem(name, JSON.stringify(obj));
  } else {
    window.localStorage.setItem(name, JSON.stringify(obj));
  }
};
/**
 * 获取localStorage
 */

export const getStore = (params = {}) => {
  let { name, debug } = params;
  name = keyName + name;
  let obj = {};

  let content;

  obj = window.sessionStorage.getItem(name);
  if (validatenull(obj) || validatenull(JSON.parse(obj).content)) {
    obj = window.localStorage.getItem(name);
  }
  if (validatenull(obj)) {
    return;
  }
  try {
    obj = JSON.parse(obj);
  } catch (e) {
    return obj;
  }
  if (debug) {
    return obj;
  }
  // 如果有设置过期，则判断是否过期
  if (!validatenull(obj.expiresIn)) {
    if (new Date().getTime() - obj.datetime > obj.expiresIn * 1000) {
      removeStore({ name: name.substring(keyName.length) });
      return;
    }
  }
  /* eslint-disable */
  if (obj.dataType === 'string') {
    content = obj.content;
  } else if (obj.dataType === 'number') {
    content = Number(obj.content);
  } else if (obj.dataType === 'boolean') {
    content = eval(obj.content);
  } else if (obj.dataType === 'object') {
    content = obj.content;
  }
  return content;

  /* eslint-disable */
};
/**
 * 删除localStorage
 */
export const removeStore = (params = {}) => {
  let { name, type } = params;

  name = keyName + name;
  if (type) {
    window.sessionStorage.removeItem(name);
  } else {
    window.localStorage.removeItem(name);
  }
};

/**
 * 获取全部localStorage
 */
export const getAllStore = (params = {}) => {
  const list = [];
  const { type } = params;

  if (type) {
    for (let i = 0; i <= window.sessionStorage.length; i++) {
      list.push({
        name: window.sessionStorage.key(i),
        content: getStore({
          name: window.sessionStorage.key(i),
          type: 'session'
        })
      });
    }
  } else {
    for (let i = 0; i <= window.localStorage.length; i++) {
      list.push({
        name: window.localStorage.key(i),
        content: getStore({
          name: window.localStorage.key(i)
        })
      });
    }
  }
  return list;
};

/**
 * 清空全部localStorage
 */
export const clearStore = (params = {}) => {
  const { type } = params;

  if (type) {
    window.sessionStorage.clear();
  } else {
    window.localStorage.clear();
  }
};
