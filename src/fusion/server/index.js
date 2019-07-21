'use strict'

const path = require('path')

const React = require('react')
const ReactDOM = require('react-dom/server')
const { ServerStyleSheet } = require('styled-components')

const getTags = require('./tags')

const unpack = require('../../utils/unpack')

const { defaultOutpuType, distRoot } = require('../../../env')

function render (context = {}) {
  const { outputType } = context
  const OutputType = unpack(
    require(path.join(
      distRoot,
      'components',
      'output-types',
      outputType || defaultOutpuType
    ))
  )

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

module.exports = render
