'use strict'

function getAbsoluteRequire (mod) {
  return require
    .resolve(mod)
    .replace(
      new RegExp(
        `([\\/]node_modules[\\/]${mod.replace(/[\\/]/g, '[\\\\/]')}).*`
      ),
      (_, g) => g
    )
}

module.exports = {
  getAbsoluteRequire
}
