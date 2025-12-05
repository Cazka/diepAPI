const path = require('path');
const webpack = require('webpack');
const WrapperPlugin = require('wrapper-webpack-plugin');
const packageJson = require('./package.json');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'diepAPI.user.js',
    library: 'diepAPI',
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new WrapperPlugin({
      header: `// ==UserScript==
// @name         diepAPI
// @description  ${packageJson.description} - ${packageJson.homepage}
// @version      ${packageJson.version}
// @author       ${packageJson.author}
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @run-at       document-start
// @grant        none
// ==/UserScript==
(() => {
  const _window = 'undefined' == typeof unsafeWindow ? window : unsafeWindow;
  if (_window.diepAPI) return;

`,
      footer: '\n\n  _window.diepAPI = diepAPI;\n})();'
    })
  ]
};
