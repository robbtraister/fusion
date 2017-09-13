'use strict'

const render = (template, status) => data => (req, res, next) => {
  if (status) {
    res.status(status)
  }

  data = data || {}
  const uri = req.path
  Object.assign(data, {uri})

  res.render(template, data, (err, html) => {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports = render
