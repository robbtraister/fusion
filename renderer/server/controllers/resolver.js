'use strict'

const Content = require('./content')
const Template = require('./template')

function Resolver (uri) {
  const content = Content(uri)
  const template = Template(uri)

  const resolver = Promise.all([content, template])
    .then(data => ({
      content: data[0],
      template: data[1]
    }))

  resolver.content = content
  resolver.template = template

  return resolver
}

module.exports = Resolver
