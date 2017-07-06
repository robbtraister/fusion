'use strict'

require('babel-core/register')

// const debug = require('debug')(`fusion:controllers:render:${process.pid}`)

const ReactDOMServer = require('react-dom/server')

const template = require('../template')

const content = require('./content')
const templates = require('./templates')

function renderWithContent (templateName, contentURI, body, options) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(template(templateName, contentURI, body, options))
}

function render (templateName, contentURI, options) {
  return content.fetch(contentURI)
    .then(JSON.parse.bind(JSON))
    .then(props => ReactDOMServer.renderToStaticMarkup(templates.render(templateName, props)))
    .then(body => renderWithContent(templateName, contentURI, body, options))
}

module.exports = render
module.exports.render = render
module.exports.renderWithContent = renderWithContent
