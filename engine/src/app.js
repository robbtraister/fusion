'use strict'

const path = require('path')

const express = require('express')

require('./mocks')

const { buildRoot } = require('../environment')

const app = express()

const engines = require('./engines')
Object.keys(engines)
  .forEach((ext) => {
    app.engine(
      ext,
      engines[ext]
    )
  })

app.set('view engine', '.jsx')
app.set('views', path.resolve(buildRoot, 'components/output-types'))

app.use(require('./router'))
app.use(require('./errors/middleware'))

module.exports = app
