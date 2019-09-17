const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    hot: true,
    inline: true,
    historyApiFallback: true,
    contentBase: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Lit Example',
      template: './index.tpl.html',
    }),
  ],
}
