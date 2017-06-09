'use strict'

const React = require('react')

const Engine = (Components) => {
  function render (config) {
    let elements = config.layout
      .filter(element => Components[element.component])
      .map(element => {
        let content = config.contents._default
        if (element.children) {
          content = {content: render({contents: config.contents, layout: element.children})}
        } else if (element.source) {
          content = config.contents[element.source]
        }

        let props = Object.assign({}, content, element)
        let Component = Components[element.component]
        if (Component.prototype instanceof React.Component) {
          return (new Component(props)).render()
        }
        return Component(props)
      })
    return <div>{elements}</div>
  }
  return render
}

module.exports = Engine
module.exports.Engine = Engine
module.exports.Fetcher = require('./fetcher')
