/**
 * <App /> component for the Fusion rendering platform
 *
 * Properties:
 *    children: PropTypes.node
 *    getComponent: PropTypes.func
 *    location: PropTypes.string
 *    routerContext: PropTypes.object
 *    tree: PropTypes.oneOfType([ PropTypes.array, PropTypes.object ])
 */

'use strict'

const PropTypes = require('prop-types')
const React = require('react')
const { Router, StaticRouter } = require('react-router-dom')
const { createBrowserHistory } = require('history')

const { AppContext } = require('./contexts')
const Tree = require('./tree')

const { isClient } = require('./utils')

function getDescendants (node) {
  const children = [].concat((node && node.children) || [])
  return children.concat(...children.map(getDescendants))
}

class App extends React.Component {
  constructor (props) {
    super(props)

    const { children, getComponent, tree } = props

    if (!children && tree && !getComponent) {
      throw new Error('Cannot render tree without getComponent')
    }
  }

  render () {
    const {
      children,
      getComponent,
      location,
      routerContext,
      tree,
      ...appContext
    } = this.props

    const value = {
      ...appContext,
      renderables: getDescendants({ children: tree }),
      tree
    }

    const treeProps = {
      tree,
      getComponent
    }

    return React.createElement(
      AppContext.Provider,
      {
        value
      },
      React.createElement(
        this.RouterComponent,
        this.routerProps,
        children || React.createElement(
          Tree,
          treeProps
        )
      )
    )
  }
}

class ClientApp extends App {
  constructor (props) {
    super(props)

    const { getState, singlePage } = props

    const forceRefresh = !singlePage || !getState
    const history = createBrowserHistory({ forceRefresh })
    if (forceRefresh) {
      // still have to manually reload to handle forward/back navigation
      history.listen((location, action) => {
        window.location.reload()
      })
    } else {
      history.listen((location, action) => {
        getState(location.pathname).then(state => {
          this.setState(state)
        })
      })
    }

    Object.defineProperty(this, 'routerProps', { value: { history } })
  }

  get RouterComponent () {
    return Router
  }
}

class ServerApp extends App {
  get RouterComponent () {
    return StaticRouter
  }

  get routerProps () {
    return {
      context: this.props.routerContext || {},
      location: this.props.location
    }
  }
}

App.propTypes = ClientApp.propTypes = ServerApp.propTypes = {
  children: PropTypes.node,
  getComponent: PropTypes.func,
  location: PropTypes.string,
  routerContext: PropTypes.object,
  tree: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
}

module.exports = (isClient ? ClientApp : ServerApp)
