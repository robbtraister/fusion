'use strict'

const React = require('react')
const PropTypes = require('prop-types')

function Consumer (Component) {
  class ContextWrapper extends React.Component {
    constructor (props, context) {
      super(props, context)

      class ConsumerComponent extends Component {
        get uri () {
          return context.uri
        }

        async (uri) {
          this.fetch(uri, true)
        }

        fetch (uri, asyncOnly) {
          this.state = context.fetch(uri, this, asyncOnly) || {}
        }
      }

      ConsumerComponent.defaultProps = ContextWrapper.defaultProps

      this.Component = ConsumerComponent
    }

    render () {
      return <this.Component {...this.props} />
    }
  }

  ContextWrapper.contextTypes = {
    uri: PropTypes.string,
    fetch: PropTypes.func
  }

  return ContextWrapper
}

module.exports = Consumer
