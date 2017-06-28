const fs = require('fs')
const path = require('path')

const glob = require('glob')

const entry = {
  engine: require.resolve('./src/engine')
}

;['components', 'templates'].forEach(k => {
  let list = glob.sync('*/', {
    cwd: `${__dirname}/${k}`
  })
    .map(d => d.replace(/\/*$/, ''))

  fs.writeFileSync(`./${k}/index.js`, list.map(item => `export * from './${item}'`).join('\n'))

  entry[k] = require.resolve(`./${k}`)
  list.forEach(item => {
    entry[item] = require.resolve(`./${k}/${item}`)
  })
})

module.exports = {
  entry,
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js'
  },
  externals: function (context, request, callback) {
    if (request === 'react') {
      if (context.startsWith(path.resolve('./components')) || context.startsWith(path.resolve('./template'))) {
        return callback(null, request)
      }
    }
    callback()
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
        test: /\/components\/.*\.js$/,
        exclude: /node_modules/,
        loader: ['expose-loader?Components']
      },
      {
        test: /\/templates\/.*\.js$/,
        exclude: /node_modules/,
        loader: ['expose-loader?Templates']
      },
      {
        test: require.resolve('./src/engine'),
        loader: ['expose-loader?react']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: ['babel-loader']
      },
      {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader', 'sass-loader', 'import-glob-loader']
      }
    ]
  }
}
