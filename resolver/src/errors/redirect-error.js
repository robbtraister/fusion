'use strict'

class RedirectError extends Error {
  constructor (location, statusCode) {
    super(location)
    this.location = location
    this.statusCode = statusCode || 302
  }
}

RedirectError.handler = (baseUrl) => (err) => {
  if (err instanceof RedirectError) {
    err.location = `${baseUrl || ''}${err.location}`
  }
  throw err
}

module.exports = RedirectError
