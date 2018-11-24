'use strict'

const path = require('path')

const express = require('express')

module.exports = (env) => {
  const system = Object.assign(
    {},
    env,
    require('./content')(env),
    require('./io')(env),
    require('./properties')(env)
  )

  const app = express()

  app.engine(
    '.hbs',
    require('./engines/hbs')(system)
  )

  app.engine(
    '.js',
    require('./engines/js')(system)
  )

  app.engine(
    '.jsx',
    require('./engines/jsx/render')(system)
  )

  app.engine(
    '.jsx-js',
    require('./engines/jsx/compile')(system)
  )

  app.set('view engine', '.jsx')
  app.set('views', path.resolve(env.buildRoot, 'components/output-types'))

  app.use(require('./router')(system))
  app.use(require('./errors/middleware')(system))

  return app
}
