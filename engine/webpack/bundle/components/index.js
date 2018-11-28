'use strict'

module.exports = ({ components }) => {
  return [].concat(
    require('./engines/hbs')(components),
    require('./engines/js')(components),
    require('./engines/jsx')(components)
  )
}
