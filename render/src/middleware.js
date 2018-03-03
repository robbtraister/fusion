'use strict'

const middleware = function middleware (req, res, next) {
  require('./render')()
    .then(data => res.send(data))
    .catch(next)
}

module.exports = middleware
