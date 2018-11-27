'use strict'

const path = require('path')

require('../mocks')

const React = require('react')
const ReactDOM = require('react-dom/server')

const getContext = require('./context')
const getTags = require('./tags')

const ServerLoader = require('../loaders/server-loader')
const QuarantineLoader = require('../loaders/quarantine-loader')

const getFallbacks = require('../../_shared/fallbacks')
const getRenderables = require('../../_shared/renderables')
const substitute = require('../../_shared/substitute')
const getTree = require('../../_shared/rendering-to-tree')
const unpack = require('../../_shared/unpack')

const { buildRoot } = require('../../../../environment')

global.Fusion = {
  context: React.createContext('fusion')
}

module.exports = async function renderJsx (outputTypePath, props, callback) {
  try {
    delete props.settings
    delete props.cache
    delete props._locals

    const OutputType = unpack(require(outputTypePath))
    props.tree = substitute(getTree(props), props)
    props.layout = props.tree.type
    props.renderables = getRenderables(props.tree)

    const context = getContext(props)

    const rootProps = {
      ...context.props,
      ...getTags(context)
    }

    const loaderOptions = {
      componentRoot: path.resolve(buildRoot, 'components'),
      ext: '.jsx',
      outputTypes: getFallbacks({
        ext: '.jsx',
        outputType: props.outputType
      })
    }

    const render = async (LoaderClass) => {
      const loader = new LoaderClass(loaderOptions, context)

      const root = React.createElement(
        global.Fusion.context.Provider,
        {
          value: context
        },
        React.createElement(
          OutputType,
          rootProps,
          loader.createElement(props.tree)
        )
      )

      let html = ReactDOM.renderToStaticMarkup(root)

      if (context.isPending()) {
        await context.wait()
        html = ReactDOM.renderToStaticMarkup(root)
      }

      return `<!DOCTYPE html>${html}`
    }

    try {
      callback(
        null,
        await render(ServerLoader)
      )
    } catch (err) {
      console.error(err)
      callback(
        null,
        await render(QuarantineLoader)
      )
    }
  } catch (err) {
    console.error(err)
    callback(err)
  }
}
