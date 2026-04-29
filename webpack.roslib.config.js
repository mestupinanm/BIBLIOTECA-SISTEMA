const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  target: ['web', 'es5'],
  entry: './src/vendor/roslib-legacy-entry.js',
  output: {
    path: path.resolve(__dirname, 'js/vendor'),
    filename: 'roslib-legacy.js',
    environment: {
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false,
      optionalChaining: false,
      templateLiteral: false
    },
    clean: true
  },
  module: {
    rules: [
      {
        test: /roslib-legacy-entry\.js$/,
        type: 'javascript/esm',
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.m?js$/,
        exclude: [
          /src\/vendor\/roslib-legacy-entry\.js$/,
          /node_modules\/core-js\//,
          /node_modules\/regenerator-runtime\//
        ],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    mainFields: ['browser', 'module', 'main']
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: false
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
  performance: {
    hints: false
  }
};
