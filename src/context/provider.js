'use strict'

const React = require('react')
const PropTypes = require('prop-types')

class Provider extends React.Component {
  getChildContext () {
    return {
      fetch: this.props.fetch
    }
  }

  render () {
    return (this.props.children && this.props.children.length === 1)
      ? this.props.children
      : <div>{this.props.children}</div>
  }
}

Provider.childContextTypes = {
  fetch: PropTypes.func
}

module.exports = Provider
