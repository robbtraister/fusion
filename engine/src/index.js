#!/usr/bin/env node

'use strict'

const fetch = require('./fetch')
const filter = require('./filter')
const render = require('./render')

const actions = {
  fetch,
  filter,
  render
}

const main = function main (action, data) {
  const handler = actions[action]
  return handler && handler(data)
}

module.exports = main

if (module === require.main) {
  main(...process.argv.slice(2))
}
