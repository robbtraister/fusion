const React = require('react')

const components = require('../components')

const App = (props) => {
  let elements = props.layout
    .filter(f => components[f.component])
    .map(f => {
      return components[f.component](f.id, f.content)
    })
  return <div>{elements}</div>
}

module.exports = App
module.exports.App = App
