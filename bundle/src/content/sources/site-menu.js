'use strict'

const resolve = (query) => `/site/v2/navigation?_id=${query.id}`

module.exports = {
  resolve,
  schemaName: 'sites',
  params: {
    id: 'text'
  }
}
