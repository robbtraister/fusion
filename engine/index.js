'use strict'

const React = require('react')

function hydrate (content, template) {
  return template.replace(/\{\{([^}]+)\}\}/g, function (match, prop) {
    return content[prop] || match
  })
}

const Engine = (Components) => {
  function render (props) {
    let elements = props.layout
      .filter(element => Components[element.component])
      .map(element => {
        let content = props.contents._default
        if (element.children) {
          content = render({contents: props.contents, layout: element.children})
        } else {
          if (element.source) {
            content = props.contents[element.source]
          } else if (element.content) {
            content = element.content
          }
          if (element.template) {
            content = hydrate(content, element.template)
          }
        }

        let Component = Components[element.component]
        if (Component.prototype instanceof React.Component) {
          Component = (new Component()).render
        }
        return Component(element.id, content)
      })
    return <div>{elements}</div>
  }
  return render
}

module.exports = Engine
module.exports.Engine = Engine
module.exports.Fetcher = require('./fetcher')
