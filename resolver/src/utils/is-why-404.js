'use strict'

module.exports = (req) => req && req.query && req.query.hasOwnProperty('why404')
