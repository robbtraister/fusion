'use strict'

module.exports = function promisify (fcn) {
  return function promisified () {
    return new Promise((resolve, reject) => {
      fcn(...arguments, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  }
}
