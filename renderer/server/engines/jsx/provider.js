'use strict'

const React = require('react')
const E = React.createElement
const PropTypes = require('prop-types')

const Fetcher = require('./fetcher')

class Provider extends React.Component {
  getChildContext () {
    return {
      uri: this.props.uri,
      fetch: this.props.fetch
    }
  }

  render () {
    if (this.props.cache) {
      return E('div', {},
        this.props.children,
        E('script', {dangerouslySetInnerHTML: { __html: `var contentCache=${JSON.stringify(this.props.cache)}` }})
      )
    } else {
      return this.props.children
    }
  }
}

Provider.childContextTypes = {
  uri: PropTypes.string,
  fetch: PropTypes.func
}

module.exports = Template => {
  const fetcher = Fetcher()
  const wrapper = props => E(Provider, Object.assign(fetcher, {uri: props.uri}), E(Template, props, null))
  wrapper.cache = fetcher.cache
  return wrapper
}
