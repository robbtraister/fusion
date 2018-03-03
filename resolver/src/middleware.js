'use strict'

const middleware = function middleware (req, res, next) {
  require('./resolve')(req.originalUrl)
    .then(data => res.send(data))
    .catch(next)
}

module.exports = middleware
