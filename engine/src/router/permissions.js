'use strict'

const express = require('express')

const parsePermissions = (arcPermissions) => {
  const result = {
    global: [],
    sites: {}
  }
  arcPermissions.split(';')
    .forEach(sitePermissions => {
      const permissionParts = sitePermissions.split(':')
      const permissionList = permissionParts.pop().split(',')
      const site = permissionParts.shift()
      if (site) {
        result.sites[site] = result.sites[site] || []
        Array.prototype.push.apply(result.sites[site], permissionList)
      } else {
        Array.prototype.push.apply(result.global, permissionList)
      }
    })
  return result
}

module.exports = (env) => {
  const permissionsRouter = express.Router()

  permissionsRouter.use((req, res, next) => {
    const permissions = parsePermissions(req.get('Arc-Permissions') || '')

    req.verifyAuthentication = (env.isProd)
      ? (permission) => {
        const authorized = permissions.global.includes(permission) ||
        (permissions.sites[req.arcSite] || []).includes(permission)

        if (!authorized) {
          const error = new Error()
          error.statusCode = 403
          throw error
        }
      }
      : (permission) => {}

    next()
  })

  return permissionsRouter
}
