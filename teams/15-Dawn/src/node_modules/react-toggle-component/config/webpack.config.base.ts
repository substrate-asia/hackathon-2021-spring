import { resolve } from "path";
import webpack from "webpack";

const BaseConfig: webpack.Configuration = {
  devtool: "inline-source-map",

  entry: [resolve(__dirname, "..", "src", "index.tsx")],

  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(ts|tsx)$/,
            use: [
              {
                loader: require.resolve("ts-loader"),
                options: {
                  configFile: resolve(__dirname, "..", "tsconfig.json"),
                },
              },
            ],
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".tsx"],
    alias: {},
  },
};

export default BaseConfig;
