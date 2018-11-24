'use strict'

const path = require('path')

const React = require('react')
const ReactDOM = require('react-dom/server')

const contextFactory = require('./context')
const tagFactory = require('./tags')

const ServerLoader = require('../loaders/server-loader')
const QuarantineLoader = require('../loaders/quarantine-loader')

const fallbackFactory = require('../../_shared/fallbacks')
const getTree = require('../../_shared/rendering-to-tree')
const unpack = require('../../_shared/unpack')

global.Fusion = {
  context: React.createContext('fusion')
}

module.exports = (env) => {
  require('./mocks')(env)

  const { buildRoot } = env

  const getContext = contextFactory(env)
  const getFallbacks = fallbackFactory(env)
  const getTags = tagFactory(env)

  return async function renderJsx (outputTypePath, props, callback) {
    try {
      delete props.settings
      delete props.cache
      delete props._locals

      const OutputType = unpack(require(outputTypePath))
      props.tree = getTree(props)

      const context = getContext(props)
      const tags = getTags(context)

      const rootProps = {
        ...context.props,
        ...tags,
        ...props
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
}
