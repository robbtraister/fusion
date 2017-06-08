'use strict'

const React = require('react')

const Engine = (Components) => {
  function render (layout) {
    // We want to render layout as an Array of components,
    // CSR React passes an expected Array, so don't do extra work
    if (!(layout instanceof Array)) {
      // SSR React forces the input param to an Object with '0', '1', etc keys
      layout = Object.assign([], layout)
    }

    let elements = layout
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
