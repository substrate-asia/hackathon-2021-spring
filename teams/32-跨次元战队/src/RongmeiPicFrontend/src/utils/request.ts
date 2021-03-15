/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import type { RequestMethod} from 'umi-request';
import {extend} from 'umi-request';
import {history} from 'umi';
import {notification} from 'antd';

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const {response} = error;
  if (response && response.status) {
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return response;
};

export async function getBaseUrl(service: string): Promise<string> {
  const currHost = window.location.host;
  let baseUrl = "";
  if (currHost.indexOf("rongmeitech.com") >= 0 || currHost.indexOf("http://39.102.36.169") >= 0) {
    baseUrl = `https://api.dimension.pub/${packDev(service)}`;
  } else if (currHost.indexOf("localhost") >= 0 || currHost.indexOf("dimension.pub") >= 0 || currHost.indexOf("81.70.102.195") >= 0) {
    baseUrl = `https://api.dimension.pub/${packProd(service)}`;
  }
  return baseUrl;
}

/**
 * 配置request请求时的默认参数
 */
async function request(service: string, path: string, ...option: any) {
  const baseUrl = await getBaseUrl(service);
  const url = `${baseUrl  }/${  path}`;
  const token = localStorage.getItem('token');
  if (!token || token.length === 0) {
    history.push('/home');
  }
  let requestMethod: RequestMethod;
  if (localStorage.getItem("token")) {
    requestMethod = extend({
      errorHandler, // 默认错误处理
      headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}
    });
  } else {
    requestMethod = extend({
      errorHandler, // 默认错误处理
    });
  }
  if (option.length > 0) {
    return requestMethod(url, option[0]);
  }
  return requestMethod(url);
}

function packDev(service: string): string {
  return `${service.split(".").join("_")  }_dev`;
}

function packProd(service: string): string {
  return `${service.split(".").join("_")  }_prod`;
}

export default request;
