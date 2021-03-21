/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2021-02-25 13:33:11
 */
/**
 * 配置参考:
 * https://cli.vuejs.org/zh/config/
 */

// const TerserPlugin = require('terser-webpack-plugin');
// 分析包插件
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// 基础路径，发布前修改这里,当前配置打包出来的资源都是相对路径
const url = 'https://hackathon.vonechain.com';
// const url = 'http://58.33.9.134:8088';
// const url = 'http://192.168.2.247:8088';
// const url = '';
// let publicPath = './';
const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
  // publicPath: baseURI + vueConf.baseUrl, // 根域上下文目录
  lintOnSave: true, // 是否开启eslint保存检测，有效值：ture | false | 'error'
  runtimeCompiler: true, // 运行时版本是否需要编译
  transpileDependencies: [], // 默认babel-loader忽略mode_modules，这里可增加例外的依赖包名
  productionSourceMap: false, // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度
  chainWebpack: config => {
    const entry = config.entry('app');

    entry.add('babel-polyfill').end();
    entry.add('classlist-polyfill').end();
    // 会在html页面中插入像这样的东西<link rel="prefetch">，去掉此功能
    // 首页自定义

    // 移除 prefetch 插件
    config.plugins.delete('prefetch');
    // 移除 preload 插件
    config.plugins.delete('preload');

    config.module // fixes https://github.com/graphql/graphql-js/issues/1272
      .rule('mjs$')
      .test(/\.mjs$/)
      .include.add(/node_modules/)
      .end()
      .type('javascript/auto');
  },
  css: {
    // css预设器配置项
    loaderOptions: {
      // pass options to sass-loader
      sass: {
        // 引入全局变量样式,@使我们设置的别名,执行src目录
        prependData: '@import "@/assets/css/variable.scss";'
      }
    }
  },

  configureWebpack: config => {
    if (isProduction) {
      // 为生产环境修改配置...
      // config.plugins.push(
      //   new TerserPlugin({
      //     terserOptions: {
      //       compress: {
      //         warnings: false,
      //         drop_debugger: true, // console
      //         drop_console: true, //注释console
      //         pure_funcs: ['console.log'] // 移除console
      //       }
      //     },
      //     sourceMap: false,
      //     parallel: true
      //   })
      // );
      if (process.env.npm_config_report === 'true') {
        console.log('--report----------------打包完成后，将进行分析');
        config.plugins.push(new BundleAnalyzerPlugin());
      }
      config.resolve.extensions = ['*', '.mjs', '.js', '.vue', '.json'];
    }
  },
  // 配置转发代理
  devServer: {
    disableHostCheck: true,
    port: 8082,
    proxy: {
      '/api': {
        target: url,
        ws: false, // 需要websocket 开启
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
};
