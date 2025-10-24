const path = require('path');

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
    filename: 'diepAPI.js',
    library: 'diepAPI',
  },
  optimization: {
    minimize: true,
  },
};
