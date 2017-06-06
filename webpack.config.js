const path = require('path')

module.exports = {
  entry: {
    render: './render/index.js'
  },
  output: {
    path: path.resolve('./public'),
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
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader', 'sass-loader', 'import-glob-loader']
      }
    ]
  }
}
