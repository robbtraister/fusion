#!/usr/bin/env node

'use strict'

function getManifest (env) {
  return {
    ...require('./components')(env),
    ...require('./content')(env),
    ...require('./properties')(env)
  }
}

module.exports = getManifest

if (module === require.main) {
  console.log(JSON.stringify(getManifest(require('../environment')), null, 2))
}
