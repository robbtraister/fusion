'use strict'

const React = require('react')
const PropTypes = require('prop-types')

class Provider extends React.Component {
  getChildContext () {
    return {
      uri: this.props.uri,
      fetch: this.props.fetch
    }
  }

  render () {
    return this.props.children
  }
}

Provider.childContextTypes = {
  uri: PropTypes.string,
  fetch: PropTypes.func
}

module.exports = Provider
