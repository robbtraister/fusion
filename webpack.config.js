const fs = require('fs')
const path = require('path')

const glob = require('glob')

const collections = {}
;['components', 'templates'].forEach(k => {
  let list = glob.sync('*/', {
    cwd: `${__dirname}/${k}`
  })
    .map(d => d.replace(/\/*$/, ''))

  fs.writeFileSync(`./${k}/index.js`, list.map(item => `export * from './${item}'`).join('\n'))

  collections[k] = {}
  list.forEach(item => {
    collections[k][item] = require.resolve(`./${k}/${item}`)
  })
})

function excludeReact (context, request, callback) {
  if (request === 'react') {
    return callback(null, request)
  }
  callback()
}

const resolvePreact = {
  extensions: ['.js', '.jsx'],
  alias: {
    react: 'preact-compat',
    'react-dom': 'preact-compat'
  }
}

module.exports = [
  {
    entry: {
      engine: require.resolve('./src/engine')
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
    resolve: resolvePreact,
    module: {
      loaders: [
        {
          test: require.resolve('./src/engine'),
          loader: ['expose-loader?react']
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: ['babel-loader']
        }
      ]
    }
  },

  {
    entry: {
      components: require.resolve('./components'),
      templates: require.resolve('./templates')
    },
    externals: excludeReact,
    output: {
      path: path.resolve('./dist'),
      filename: '[name].js'
    },
    resolve: resolvePreact,
    module: {
      loaders: [
        {
          test: require.resolve('./components'),
          loader: ['expose-loader?Components']
        },
        {
          test: require.resolve('./templates'),
          loader: ['expose-loader?Templates']
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: ['babel-loader']
        }
      ]
    }
  },

  {
    entry: collections.components,
    externals: excludeReact,
    output: {
      path: path.resolve('./dist/components'),
      filename: '[name].js'
    },
    resolve: resolvePreact,
    module: {
      loaders: [
        {
          loader: ['expose-loader?Components']
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: ['babel-loader']
        }
      ]
    }
  },

  {
    entry: collections.templates,
    externals: excludeReact,
    output: {
      path: path.resolve('./dist/templates'),
      filename: '[name].js'
    },
    resolve: resolvePreact,
    module: {
      loaders: [
        {
          loader: ['expose-loader?Templates']
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: ['babel-loader']
        }
      ]
    }
  }
]

/*
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader', 'sass-loader', 'import-glob-loader']
      }
    ]
  }
}
*/
