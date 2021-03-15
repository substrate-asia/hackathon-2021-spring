const { override, addWebpackAlias } = require('customize-cra')
const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const addAnalyzer = (config) => {
  if (process.env.ANALYZER) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};

// 这里覆盖webpack配置，增加路径别名
module.exports = override(function (config) {
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto'
  });

  addAnalyzer(config);

  return config;
})
//路径别名
// addWebpackAlias({
//   '@core': path.resolve(__dirname, 'src/core'),
//   '@shared': path.resolve(__dirname, 'src/shared')
// })
