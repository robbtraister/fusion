'use strict'

module.exports = function (data) {
  return Promise.resolve(JSON.stringify(data.content, null, 2))
}
