'use strict'

const generic = require('./generic')

module.exports = {
  contentConfig: require('./content-config'),
  date: generic('date'),
  email: generic('email'),
  json: generic('json'),
  label: generic('label'),
  richText: generic('richText'),
  url: generic('url')
}
