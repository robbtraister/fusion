#!/usr/bin/env node

'use strict'

function getManifest () {
  return {
    ...require('./components')(),
    ...require('./content')(),
    ...require('./properties')()
  }
}

module.exports = getManifest

if (module === require.main) {
  console.log(JSON.stringify(getManifest(), null, 2))
}
