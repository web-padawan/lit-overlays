'use strict';

const { resolve } = require('path');
const { BabelMultiTargetPlugin } = require('webpack-babel-multi-target-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './demo/index.js',
  mode: 'development',
  output: {
    path: resolve('demo'),
    filename: '[name].[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          BabelMultiTargetPlugin.loader()
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('./demo/index.html')
    }),
    // Babel configuration for multiple output bundles targeting different sets
    // of browsers
    new BabelMultiTargetPlugin({
      babel: {
        // @babel/preset-env options common for all bundles
        presetOptions: {
          // Don’t add polyfills, they are provided from webcomponents-loader.js
          useBuiltIns: false
        }
      },

      // Target browsers with and without ES modules support
      targets: {
        es6: {
          browsers: [
            'last 2 Chrome major versions',
            'last 2 ChromeAndroid major versions',
            'last 2 Edge major versions',
            'last 2 Firefox major versions'
          ],
          tagAssetsWithKey: false, // don’t append a suffix to the file name
          esModule: true // marks the bundle used with <script type="module">
        },
        es5: {
          browsers: ['ie 11'],
          tagAssetsWithKey: true, // append a suffix to the file name
          noModule: true // marks the bundle included without `type="module"`
        }
      }
    })
  ],
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase: resolve('demo'),
    compress: true,
    overlay: true,
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true
  }
};
