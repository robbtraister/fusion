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
        var content = props.contents._default
        if (element.children) {
          content = render({contents: props.contents, layout: element.children})
        } else {
          if (element.content) {
            content = props.contents[element.content]
          }
          if (element.template) {
            content = hydrate(content, element.template)
          }
        }
        return Components[element.component](element.id, content)
      })
    return <div>{elements}</div>
  }
  return render
}

module.exports = Engine
module.exports.Engine = Engine
