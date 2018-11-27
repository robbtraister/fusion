'use strict'

module.exports = {
  '.hbs': require('./hbs'),
  '.js': require('./js'),
  '.jsx': require('./jsx/render'),
  '.jsx-js': require('./jsx/compile')
}
