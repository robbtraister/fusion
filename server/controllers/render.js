'use strict'

const Render = (template, status) => data => (req, res, next) => {
  if (status) {
    res.status(status)
  }

  data = Object.assign({uri: req.path}, data)

  res.render(template, data, (err, html) => {
    if (err) {
      return next(err)
    }
    if (data && data._cache) {
      res.render(template, data)
    } else {
      res.send(html)
    }
  })
}

module.exports = Render
