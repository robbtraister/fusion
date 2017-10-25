'use strict'

const debug = require('debug')('controllers:render')

const render = (template, status) => data => (req, res, next) => {
  if (status) {
    res.status(status)
  }

  data = data || {}
  const uri = req.path
  Object.assign(data, {uri})

  debug('template', template)
  debug('data', data)
  res.render(template, data, (err, html) => {
    debug('err', err)
    debug('html', html)
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports = render
