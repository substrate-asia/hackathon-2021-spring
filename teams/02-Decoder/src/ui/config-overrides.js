const {
  override,
  addWebpackAlias
} = require("customize-cra");
const path = require("path");

const supportMjs = () => (webpackConfig) => {
  webpackConfig.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });
  return webpackConfig;
};

module.exports = override(
  supportMjs(),
  addWebpackAlias({
    "@": path.resolve(__dirname, "./src"),
    "@componenst": path.resolve(__dirname, "./src/components"),
    "@hooks": path.resolve(__dirname, "./src/hooks"),
  })
);
