'use strict'

const React = require('react')

const ClientLoader = require('./client-loader')

const appendBoundary = (component) =>
  (props) => {
    const { id } = props

    const boundaryProps = {
      'data-fusion-component': id,
      style: { display: 'none' }
    }

    return React.createElement(
      React.Fragment,
      {
        key: id
      },
      [
        React.createElement(
          'fusion-enter',
          Object.assign(
            {
              id: `fusion-enter-${id}`,
              key: `fusion-enter-${id}`
            },
            boundaryProps
          )
        ),
        React.createElement(
          component,
          props
        ),
        React.createElement(
          'fusion-exit',
          Object.assign(
            {
              id: `fusion-exit-${props.id}`,
              key: `fusion-exit-${props.id}`
            },
            boundaryProps
          )
        )
      ]
    )
  }

class AdminLoader extends ClientLoader {
  loadComponent (node) {
    return appendBoundary(super.loadComponent(node))
  }
}

module.exports = AdminLoader
