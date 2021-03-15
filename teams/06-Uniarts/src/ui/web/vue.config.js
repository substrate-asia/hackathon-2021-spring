const path = require("path");

function resolve(dir) {
    return path.join(__dirname, dir);
}

const CompressionWebpackPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const productionGzipExtensions = ["js", "css", "png", "webp"];

module.exports = {
    chainWebpack: (config) => {
        config.plugin("html").tap((options) => {
            options[0].title = process.env.VUE_APP_NAME;
            return options;
        });
        config.module
            .rule("svg")
            .exclude.add(resolve("src/assets/icons"))
            .end();
        config.module
            .rule("svgSpriteLoader")
            .test(/\.svg$/)
            .include.add(resolve("src/assets/icons"))
            .end()
            .use("svg-sprite-loader")
            .loader("svg-sprite-loader")
            .options({
                symbolId: "icon-[name]",
            })
            .end();
        config.module
            .rule("mjs")
            .test(/\.mjs$/)
            .include.add(/node_modules/)
            .end()
            .type("javascript/auto")
            .end();
    },
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === "production") {
            // 生产环境 开启gzip
            config.plugins.push(
                new CompressionWebpackPlugin({
                    filename: "[path].gz[query]",
                    algorithm: "gzip",
                    test: new RegExp(
                        "\\.(" + productionGzipExtensions.join("|") + ")$"
                    ),
                    threshold: 10240,
                    minRatio: 0.8,
                })
            );
            // 添加source map
            config.devtool = "cheap-module-source-map";
            config.optimization = {
                minimize: true,
                minimizer: [
                    new TerserPlugin({
                        terserOptions: {
                            compress: {
                                // drop_console: true,//console
                                drop_debugger: true,
                                // pure_funcs: ['console.log']//移除console
                            },
                            ie8: true,
                            safari10: true,
                        },
                    }),
                ],
            };
        }
        // 解析命令行打包参数
        // const envObj = {}
        // Object.keys(environment).forEach(v =>{
        //     envObj[`process.env.${v}`] = JSON.stringify(environment[v])
        // })
        // config.plugins.push(
        //     new webpack.DefinePlugin(envObj)
        // );
    },
    devServer: {
        port: 5100,
        proxy: {
            "/test/api": {
                target: "192.168.0.128:5000", // 接口的域名 测试
                pathRewrite: {
                    "^/test/api": "/api",
                },
            },
            "/api": {
                target: "https://app.uniarts.me", // 接口的域名 测试
                pathRewrite: {
                    "^api": "/api",
                },
            },
        },
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `@import "@/assets/styles/var.scss";`,
            },
        },
    },
};
