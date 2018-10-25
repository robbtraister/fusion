'use strict'

const getManifest = require('./get-manifest')

// make this async so it is similar to the sources one
module.exports = async () => {
  const schemaManifest = getManifest('schemas')

  return Object.assign(
    ...Object.keys(schemaManifest)
      .map((schemaName) => ({ [schemaName]: schemaName }))
  )
}
