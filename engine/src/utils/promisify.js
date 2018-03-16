'use strict'

function promisify (fcn) {
  return function () {
    const slice = Array.prototype.slice
    return new Promise((resolve, reject) => {
      fcn.apply(null, slice.call(arguments).concat(function (err) {
        err ? reject(err) : resolve.apply(null, slice.call(arguments, 1))
      }))
    })
  }
}

function throws (fcn) {
  return function () {
    const slice = Array.prototype.slice
    return new Promise((resolve, reject) => {
      try {
        fcn.apply(null, slice.call(arguments).concat(function () {
          resolve.apply(null, slice.call(arguments, 0))
        }))
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = promisify
module.exports.promisify = promisify
module.exports.throws = throws
