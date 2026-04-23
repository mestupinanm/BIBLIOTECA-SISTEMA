var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env, argv) {
  var isProd = argv.mode === 'production';

  return {
    entry: './src/main.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      clean: true,
      publicPath: isProd ? '/apps/robot-page/biblioteca/' : '/'
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules\/(?!(@supabase)\/).*/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './index.html' }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'public', to: '.' }]
      })
    ],
    devServer: {
      port: 8080,
      static: { directory: path.join(__dirname, 'public') },
      historyApiFallback: true,
      hot: false
    }
  };
};
