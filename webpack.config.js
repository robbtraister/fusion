const path = require('path')

module.exports = {
  entry: {
    components: './components/index.js',
    engine: './engine/mount.js'
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
