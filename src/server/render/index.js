'use strict'

const resolve = require('../resolve')

const {
  defaultOutputType
} = require('../../../env')

const render = require('../../fusion/server')

module.exports = async (context = {}) => render({
  ...context,
  ...await resolve(context.template || 'abc'),
  outputType: context.outputType || defaultOutputType,
})
