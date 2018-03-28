'use strict'

const resolve = (key) => `/site/v2/navigation?_id=${key.id || key}`

module.exports = {
  resolve,
  schemaName: 'sites'
}
