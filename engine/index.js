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
      .filter(f => Components[f.component])
      .map(f => {
        var c = props.content
        if (f.children) {
          c = render({content: c, layout: f.children})
        } else if (f.template) {
          c = hydrate(c, f.template)
        }
        return Components[f.component](f.id, c)
      })
    return <div>{elements}</div>
  }
  return render
}

module.exports = Engine
module.exports.Engine = Engine
