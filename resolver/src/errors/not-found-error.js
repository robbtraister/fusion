'use strict'

class NotFoundError extends Error {
  constructor (message, info = {}) {
    super(message)

    this.message = message
    this.statusCode = 404
    this.info = info
  }

  toJSON () {
    return {
      message: this.message,
      status: this.statusCode,
      info: this.info
    }
  }
}

module.exports = NotFoundError
