const path = require('path')
const componentDir = path.join(__dirname, 'components')

module.exports = {
  entry: {
    components: './components/index.js',
    engine: './engine/mount.js'
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
  externals: function (context, request, callback) {
    if (request === 'react') {
      if (context.startsWith(componentDir)) {
        return callback(null, request)
      }
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
        test: require.resolve('./engine/mount.js'),
        loader: 'expose-loader?react'
      },
      {
        test: require.resolve('./components/index.js'),
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
