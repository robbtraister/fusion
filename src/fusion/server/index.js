'use strict'

const path = require('path')

const glob = require('glob')
const React = require('react')
const ReactDOM = require('react-dom/server')
const { ServerStyleSheet } = require('styled-components')

const getTags = require('./tags')

const unpack = require('../../utils/unpack')

const { defaultOutputType, distRoot } = require('../../../env')

const outputTypes = {}
glob.sync(path.join(distRoot, 'components', 'output-types', '*.js'))
  .forEach((filePath) => {
    const outputType = path.parse(filePath).name
    const OutputType = unpack(require(filePath))
    outputTypes[outputType] = OutputType
    if (OutputType && OutputType.transforms) {
      Object.keys(OutputType.transforms)
        .forEach((transform) => {
          outputTypes[transform] = OutputType
        })
    }
  })

async function render ({ OutputType, context = {} }) {
  const sheet = new ServerStyleSheet()
  try {
    const html = ReactDOM.renderToStaticMarkup(
      sheet.collectStyles(
        React.createElement(OutputType, {
          ...getTags(context),
          context
        })
      )
    )

    // if (context.url) {
    //   const redirect = new Error(`redirect to: ${context.url}`)
    //   redirect.location = context.url
    //   throw redirect
    // }

    return `<!DOCTYPE html>${html.replace(
      /<styled-components><\/styled-components>/g,
      sheet.getStyleTags()
    )}`
  } finally {
    sheet.seal()
  }
}

module.exports = async (context) => {
  const { outputType } = context
  const OutputType = outputTypes[outputType] || defaultOutputType
  const transform = OutputType.transforms && OutputType.transforms[outputType]

  const html = await render({ context, OutputType })

  return (transform)
    ? transform(html, context)
    : html
}
