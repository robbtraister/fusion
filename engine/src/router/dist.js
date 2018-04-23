'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const {
  distRoot,
  isDev,
  outputTypes
} = require('../environment')

const {
  compile,
  fetchFromS3,
  fetchRendering
} = require('../scripts')

const distRouter = express.Router()

const staticHandler = (isDev)
  ? (location) => express.static(`${distRoot}${location || ''}`)
  // should be handled by nginx
  : (location) => (req, res, next) => {
    fetchFromS3(`${location || ''}${req.path}`)
      .then(src => { res.send(src) })
  }

distRouter.use('/engine', staticHandler('/engine'))
distRouter.all(/\.css$/, staticHandler())

// if POSTed, we will re-generate
distRouter.get(/\.js$/, staticHandler())

function getTypeRouter (type) {
  const fetchType = fetchRendering(type)

  const typeRouter = express.Router()

  typeRouter.all('/:id/:outputType.js',
    bodyParser.json(),
    (req, res, next) => {
      const id = req.params.id
      const payload = Object.assign(
        {id},
        req.body
      )

      const outputType = req.params.outputType
      const useComponentLib = req.query.useComponentLib === 'true'

      // if a raw rendering, don't give a name so it won't be saved
      const name = type === 'rendering' ? null : `${type}/${id}`

      fetchType(payload)
        .then(({rendering}) => compile({name, rendering, outputType, useComponentLib}))
        // if (isDev && !useComponentLib) {
        //   src += `;Fusion.Template.css=\`${css.replace('`', '\\`')}\``
        // }
        .then((src) => { res.set('Content-Type', 'application/javascript').send(src) })
        .catch(next)
    }
  )

  if (type !== 'rendering') {
    typeRouter.post(['/', '/:id'],
      bodyParser.json(),
      (req, res, next) => {
        const id = req.params.id
        const payload = Object.assign(
          {id},
          req.body
        )

        const name = `${type}/${id}`

        fetchType(payload)
          .then(({rendering}) => Promise.all(outputTypes.map((outputType) => compile({name, rendering, outputType}))))
          .then(() => { res.sendStatus(200) })
          .catch(next)
      }
    )
  }

  return typeRouter
}

distRouter.use('/page', getTypeRouter('page'))
distRouter.use('/rendering', getTypeRouter('rendering'))
distRouter.use('/template', getTypeRouter('template'))

module.exports = distRouter
