'use strict'

class RedirectError extends Error {
  constructor (location, statusCode) {
    super(location)
    this.location = location
    this.statusCode = statusCode || 302
  }
}

module.exports = RedirectError
