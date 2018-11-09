'use strict'

const React = require('react')

// this extracts an already-wrapped component name
const getName = (Component) =>
  (Component.displayName || Component.name || 'Component').replace(/.*\((.+)\)/, (_, name) => name)

module.exports =
  (ErrorComponent) =>
    (Component) => {
      const name = getName(Component)

      class Quarantine extends React.Component {
        constructor (props) {
          super(props)

          this.state = {
            error: null
          }
        }

        componentDidCatch (error, info) {
          console.error(error, info)
          this.setState({ error })
        }

        render () {
          return (this.state.error)
            ? ErrorComponent({ name, error: this.state.error })
            : React.createElement(Component, this.props)
        }
      }

      Quarantine.displayName = `FusionQuarantine(${name})`

      return Quarantine
    }
