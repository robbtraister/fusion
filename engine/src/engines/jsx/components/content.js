'use strict'

const React = require('react')

const Consumer = require('./consumer')

class Content extends React.Component {
  constructor (props) {
    super(props)

    this.fetchContent({
      content: props
    })
  }

  render () {
    const children = (this.props.children instanceof Array)
      ? this.props.children
      : [this.props.children]

    return children.map(
      (child, index) =>
        React.createElement(
          child,
          {
            key: index,
            ...this.state.content
          }
        )
    )
  }
}

module.exports = Consumer(Content)
