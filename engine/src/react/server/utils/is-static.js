'use strict'

module.exports = (Component, outputType) => {
  return (Component.static === true) ||
    (
      (Component.static instanceof Array) &&
      (Component.static.includes(outputType))
    )
}
