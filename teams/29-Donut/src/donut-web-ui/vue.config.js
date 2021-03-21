module.exports = {
  lintOnSave: false,
  devServer: {
    proxy: {
      '/nps': {
        // target: 'http://1.15.101.110:3000/nps',
        target: 'http://127.0.0.1:3000/nps',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/nps': ''
        }
      }
    }
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  configureWebpack: {
    resolve: {
      // .mjs needed for https://github.com/graphql/graphql-js/issues/1272
      extensions: ['*', '.mjs', '.js', '.vue', '.json', '.gql', '.graphql']
    },
    module: {
      rules: [ // fixes https://github.com/graphql/graphql-js/issues/1272
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    }
  }
}
