'use strict'

const { useContext } = require('react')

const { AppContext } = require('./contexts')

function useAppContext () {
  return useContext(AppContext)
}

module.exports = {
  useAppContext
}
