'use strict'

module.exports = function promisify (cb) {
  return function promisified () {
    return new Promise((resolve, reject) => {
      cb(...arguments, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  }
}
