'use strict'

const React = require('react')

const Engine = (Components) => {
  function render (layout) {
    // We want to render layout as an Array of components,
    // but React forces the input param to an Object
    let elements = Object.assign([], layout)
      .filter(f => Components[f.component])
      .map(f => {
        let content = f.children ? render(f.children) : f.content
        return Components[f.component](f.id, content)
      })
    return <div>{elements}</div>
  }
  return render
}

module.exports = Engine
module.exports.Engine = Engine
