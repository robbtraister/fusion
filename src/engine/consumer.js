'use strict'

const React = require('react')
const PropTypes = require('prop-types')

function Consumer (Component) {
  class ContextWrapper extends React.Component {
    constructor (props, context) {
      super(props, context)

      let _this = this

      class ConsumerComponent extends Component {
        async (uri) {
          this.fetch(uri, true)
        }

        fetch (uri, asyncOnly) {
          this.state = context.fetch(uri, _this, asyncOnly) || {}
        }
      }

      this.component = new ConsumerComponent(props)
    }

    setState (updater, callback) {
      this.component.setState(updater, callback)
      super.setState && super.setState(updater, callback)
    }

    componentWillMount () {
      this.component.componentWillMount && this.component.componentWillMount()
    }

    componentDidMount () {
      this.component.componentDidMount && this.component.componentDidMount()
    }

    componentWillReceiveProps (nextProps) {
      this.component.componentWillReceiveProps && this.component.componentWillReceiveProps(nextProps)
    }

    shouldComponentUpdate (nextProps, nextState) {
      return this.component.shouldComponentUpdate
        ? this.component.shouldComponentUpdate(nextProps, nextState)
        : true
    }

    componentWillUpdate (nextProps, nextState) {
      this.component.componentWillUpdate && this.component.componentWillUpdate(nextProps, nextState)
    }

    componentDidUpdate (prevProps, prevState) {
      this.component.componentDidUpdate && this.component.componentDidUpdate(prevProps, prevState)
    }

    componentWillUnmount () {
      this.component.componentWillUnmount && this.component.componentWillUnmount()
    }

    render () {
      return this.component.render()
    }
  }

  ContextWrapper.contextTypes = {
    fetch: PropTypes.func
  }

  return ContextWrapper
}

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
