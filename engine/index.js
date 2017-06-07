const React = require('react')

const Engine = (Components) => {
  return (props) => {
    let elements = props.layout
      .filter(f => Components[f.component])
      .map(f => {
        return Components[f.component](f.id, f.content)
      })
    return <div>{elements}</div>
  }
}

module.exports = Engine
module.exports.Engine = Engine
