'use strict'

const React = require('react')

class Provider extends React.Component {
  getChildContext () {
    return {
      fetch: this.props.fetch
    }
  }

  render () {
    return this.props.children
  }
}

Provider.childContextTypes = {
  fetch: React.PropTypes.func
}

module.exports = Provider
