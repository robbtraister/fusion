'use strict'

const React = require('react')
const PropTypes = require('prop-types')

function Consumer (Component) {
  class ContextWrapper extends React.Component {
    constructor (props, context) {
      super(props, context)

      let wrapper = this

      class ConsumerComponent extends Component {
        async (uri) {
          this.fetch(uri, true)
        }

        fetch (uri, asyncOnly) {
          this.state = context.fetch(uri, wrapper, asyncOnly) || {}
        }

        forceUpdate () {
          wrapper.forceUpdate()
        }
      }

      ConsumerComponent.defaultProps = ContextWrapper.defaultProps

      this.component = new ConsumerComponent(props)
    }

    setState (updater, callback) {
      this.component.setState && this.component.setState(updater, callback)
      super.setState(updater, callback)
    }

    shouldComponentUpdate (nextProps, nextState) {
      return this.component.shouldComponentUpdate
        ? this.component.shouldComponentUpdate(nextProps, nextState)
        : true
    }

    render () {
      return this.component.render()
    }
  }

  ;[
    'componentWillMount',
    'componentDidMount',
    'componentWillReceiveProps',
    'componentWillUpdate',
    'componentDidUpdate',
    'componentWillUnmount'
  ].forEach(m => {
    ContextWrapper.prototype[m] = function () {
      return this.component[m] && this.component[m].apply(this.component, arguments)
    }
  })

  ContextWrapper.contextTypes = {
    fetch: PropTypes.func
  }

  return ContextWrapper
}

/*
// this impl is not unwrapped properly by Preact
function Consumer (Component) {
  const ContextWrapper = (props, context) => {
    class ConsumerComponent extends Component {
      async (uri) {
        this.fetch(uri, true)
      }

      fetch (uri, asyncOnly) {
        this.state = context.fetch(uri, this, asyncOnly) || {}
      }
    }

    return new ConsumerComponent(props)
  }

  ContextWrapper.contextTypes = {
    fetch: PropTypes.func
  }

  return ContextWrapper
}
*/

/*
// this impl prevents fetch/async from being called in Component's constructor
function Consumer (Component) {
  class ContextWrapper extends Component {
    constructor (props, context) {
      super(props, context)

      this.fetch = (uri, asyncOnly) => {
        this.state = context.fetch(uri, this, asyncOnly) || {}
      }
      this.async = (uri) => this.fetch(uri, true)
    }
  }

  ContextWrapper.contextTypes = {
    fetch: PropTypes.func
  }

  return ContextWrapper
}
*/

module.exports = Consumer
