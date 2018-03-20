'use strict'

const bodyParser = require('body-parser')
const express = require('express')

// const debugTimer = require('debug')('fusion:timer:router')

const compile = require('../react/server/compile/pack')

// const timer = require('../timer')

const {
  findRenderableItem,
  getPageHead,
  getRendering,
  getTemplateHead
} = require('../renderings')

const {
  uploadScript
} = require('../resources')

const renderRouter = express.Router()

function getTypeRouter (fetch) {
  const typeRouter = express.Router()
  typeRouter.all(['/', '/:id', '/:id/:child'],
    bodyParser.json(),
    (req, res, next) => {
      // const tic = timer.tic()
      const payload = Object.assign(
        {
          id: req.params.id,
          child: req.params.child
        },
        req.body
      )

      fetch(payload.id)
        .then(({pt, rendering}) => {
          const {rootRenderable, upload} = (payload.child)
            ? {
              rootRenderable: findRenderableItem(rendering)(payload.child),
              upload: () => null
            }
            : {
              rootRenderable: rendering,
              upload: (pt)
                ? (src) => uploadScript(pt, src)
                : () => null
            }

          return compile(rootRenderable)
            .then(src => {
              return upload(src)
                .then(() => res.send(src))
            })
        })
        .catch(next)
    }
  )
  return typeRouter
}

renderRouter.use('/page', getTypeRouter(getPageHead))
renderRouter.use('/rendering', getTypeRouter(getRendering))
renderRouter.use('/template', getTypeRouter(getTemplateHead))

module.exports = renderRouter
