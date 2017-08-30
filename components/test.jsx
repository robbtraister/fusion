'use strict'

const React = require('react')
const Consumer = require('consumer')

class Test extends React.Component {
  constructor (props) {
    super(props)
    this.fetch(props.content || `/_content/test-component`, props.async)
  }

  render () {
    return <div is uri={this.props.content}>{this.state.body}</div>
  }
}

module.exports = Consumer(Test)
