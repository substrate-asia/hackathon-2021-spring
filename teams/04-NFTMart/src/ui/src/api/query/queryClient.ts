/* eslint-disable import/prefer-default-export */
import { QueryClient } from 'react-query';

// 在着添加全局请求逻辑与配置，如 Headers
// Add global request logic here, like adding headers
// export const defaultQueryFn = async () => {
//   //
// }

export const queryClient = new QueryClient({
  // 在这添加全局错误处理 Add error handling here
  defaultOptions: {
    // mutations: {

    // },

    queries: {
      // retry: false,
      // queryFn: defaultQueryFn
    },
  },
});
