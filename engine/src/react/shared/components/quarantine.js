'use strict'

const React = require('react')

// this extracts an already-wrapped component name
const getName = (Component) =>
  (Component.displayName || Component.name || 'Component').replace(/.*\((.+)\)/, (_, name) => name)

module.exports = (Component, fp) => {
  class Quarantine extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        error: null
      }
    }

    componentDidCatch (error, info) {
      console.error(fp, error, info)
      this.setState({ error })
    }

    render () {
      return (this.state.error)
        ? React.createElement('div', {'data-fusion-message': this.state.error})
        : React.createElement(Component, this.props)
    }
  }

  Quarantine.displayName = `FusionQuarantine(${getName(Component)})`

  return Quarantine
}
