'use strict'

const React = require('react')
const Consumer = require('./consumer')

class Test extends React.Component {
  constructor (props) {
    super(props)
    this.fetch(`/_content/test-component`)
  }

  render () {
    return <div>{this.state.body}</div>
  }
}

module.exports = Consumer(Test)
