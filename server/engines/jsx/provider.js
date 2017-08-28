'use strict'

const React = require('react')
const E = React.createElement
const PropTypes = require('prop-types')

const Fetcher = require('./fetcher')

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

module.exports = Template => {
  const fetcher = Fetcher()
  const wrapper = props => E(Provider, fetcher, E(Template, props, null))
  wrapper.cache = fetcher.cache
  return wrapper
}
