'use strict'

const React = require('react')
const PropTypes = require('prop-types')

class Provider extends React.Component {
  getChildContext () {
    return {
      async: (uri, comp) => this.props.fetch(uri, comp, true),
      fetch: this.props.fetch
    }
  }

  render () {
    return this.props.children
  }
}

Provider.childContextTypes = {
  async: PropTypes.func,
  fetch: PropTypes.func
}

module.exports = Provider
