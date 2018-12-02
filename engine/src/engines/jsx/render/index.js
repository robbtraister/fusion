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
        (props.child)
          ? loader.createElement(props.child)
          : React.createElement(
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

      return html
    }

    try {
      callback(
        null,
        {
          contentType: OutputType.contentType,
          data: await render(ServerLoader)
        }
      )
    } catch (err) {
      console.error(err)
      callback(
        null,
        {
          contentType: OutputType.contentType,
          data: await render(QuarantineLoader)
        }
      )
    }
  } catch (err) {
    console.error(err)
    callback(err)
  }
}
