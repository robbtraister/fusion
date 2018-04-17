'use strict'

const mongoUrls = {}
process.env.MONGO_URLS
  .split(/\s/)
  .map(u => u.trim())
  .filter(u => u)
  .map(u => u.split('|'))
  .forEach(([env, mongoUrl]) => {
    mongoUrls[env] = mongoUrl
  })

module.exports = mongoUrls
