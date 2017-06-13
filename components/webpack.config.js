const path = require('path')

module.exports = {
  entry: {
    components: './src/index.js'
  },
  output: {
    path: path.resolve('../dist'),
    filename: '[name].js'
  },
  externals: function (context, request, callback) {
    if (request === 'react') {
      return callback(null, request)
    }
    callback()
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
        test: require.resolve('./src/index.js'),
        loader: 'expose-loader?Components'
      },
      {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader', 'sass-loader', 'import-glob-loader']
      }
    ]
  }
}
