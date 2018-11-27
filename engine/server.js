'use strict'

const env = require('./environment')

const app = require('./src/app')

function server (port) {
  port = port || env.PORT || 8080

  return app.listen(port, (err) => {
    err ? console.error(err) : console.log(`Listening on port: ${port}`)
  })
}

module.exports = server

if (module === require.main) {
  server()
}
