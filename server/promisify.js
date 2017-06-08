'use strict'

module.exports = function (cb) {
  return function () {
    return new Promise((resolve, reject) => {
      cb(...arguments, function (err, data) {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  }
}
