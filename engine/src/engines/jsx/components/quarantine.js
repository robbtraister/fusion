'use strict'

const React = require('react')

const Message = require('./message')

// this extracts an already-wrapped component name
const getName = (Component) =>
  (Component.displayName || Component.name || 'Component').replace(/.*\((.+)\)/, (_, name) => name)

const DefaultErrorComponent = ({ error }) =>
  React.createElement(
    Message,
    { message: error }
  )

module.exports =
  (ErrorComponent) =>
    (Component, name) => {
      name = name || getName(Component)

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
            ? React.createElement(ErrorComponent || DefaultErrorComponent, { error: this.state.error, name })
            : React.createElement(Component, this.props)
        }
      }

      Quarantine.displayName = `FusionQuarantine(${name})`

      return Quarantine
    }
