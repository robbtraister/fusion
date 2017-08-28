'use strict'

const React = require('react')
const E = React.createElement
const PropTypes = require('prop-types')

class Provider extends React.Component {
  getChildContext () {
    return {
      fetch: this.props.fetch
    }
  }

  render () {
    if (this.props.cache) {
      return E('div', {},
        E('script', {dangerouslySetInnerHTML: { __html: `var contentCache=${JSON.stringify(this.props.cache)}` }}),
        this.props.children
      )
    } else {
      return this.props.children
    }
  }
}

Provider.childContextTypes = {
  fetch: PropTypes.func
}

module.exports = Provider
