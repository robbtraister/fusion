const path = require('path')

module.exports = {
  entry: {
    engine: './src/engine/mount.js'
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js'
  },
  devServer: {
    inline: true,
    contentBase: './public',
    port: 8100
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: require.resolve('./src/engine/mount.js'),
        loader: 'expose-loader?react'
      }
    ]
  }
}
