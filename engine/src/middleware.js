'use strict'

const middleware = function middleware (req, res, next) {
  if (req.query.source) {
    new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(req.query.key))
      } catch (e) {
        reject(e)
      }
    })
      .catch(() => req.query.key)
      // re-require on request to ensure invalidated cache is reloaded
      .then(key => require('./fetch')(req.query.source, key))
      .then(data => res.send(data))
      .catch(next)
  } else {
    require('./render')({})
      .then(data => res.send(data))
      .catch(next)
  }
}

module.exports = middleware
