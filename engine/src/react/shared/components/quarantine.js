'use strict'

const React = require('react')

module.exports = (Component, fp) =>
  class extends React.Component {
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
