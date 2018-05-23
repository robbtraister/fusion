'use strict'

const isPage = (rendering) => /p[A-Za-z0-9]{13}/.test(rendering._pt)

module.exports = {
  isPage
}
