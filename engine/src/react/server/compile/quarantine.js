'use strict'

/* global Fusion */

const React = require('react')
const ReactDOM = require('react-dom/server')

const reactParser = require('html-react-parser')

const getTree = require('../../shared/compile/tree')
const loadComponent = require('./load-component')

const { LOG_TYPES, ...logger } = require('../../../utils/logger')

class QuarantineCompiler {
  constructor (renderable, outputType) {
    this.renderable = renderable
    this.outputType = outputType
  }

  compile () {
    const tree = getTree(this.renderable, this.outputType)

    // The calculated result we export for rendering must be a Component (not Element)
    // Also, react elements cannot be extended, so using a Component function allows us to add layout property
    const Component = (props) =>
      React.createElement(
        Fusion.context.Consumer,
        {},
        (context) => {
          const wrapComponent = (Component, node) => {
            try {
              return reactParser(
                ReactDOM.renderToStaticMarkup(
                  React.createElement(
                    Fusion.context.Provider,
                    { value: context },
                    Component
                  )
                )
              )
            } catch (e) {
              logger.logWarn({
                logType: LOG_TYPES.COMPONENT,
                message: `An error occurred while attempting to render component [${node.collection}/${node.type}].`,
                stackTrace: e.stack,
                values: {
                  collection: node.collection,
                  type: node.type
                }
              })
              return React.createElement(
                'div',
                {
                  key: node.props.id,
                  type: node.props.type,
                  id: node.props.id,
                  name: node.props.name,
                  'data-fusion-message': `${node.collection.replace(/s$/, '')} [${node.type}] could not be rendered`
                }
              )
            }
          }

          const getComponent = (defaultComponent = 'div') => {
            return (node) => {
              const Component = this.loadComponent(node.collection, node.type) || defaultComponent

              const props = (Component === React.Fragment)
                ? { key: node.props.key || node.props.id }
                : node.props

              return wrapComponent(
                React.createElement(
                  Component,
                  props,
                  renderAll(node.children)
                ),
                node
              )
            }
          }

          const getFeature = (node) => {
            const Feature = this.loadComponent(node.collection, node.type)

            return (Feature)
              ? wrapComponent(
                React.createElement(
                  Feature,
                  node.props
                ),
                node
              )
              : React.createElement(
                'div',
                {
                  key: node.props.id,
                  type: node.props.type,
                  id: node.props.id,
                  name: node.props.name,
                  'data-fusion-message': `feature [${node.type}] could not be rendered`
                }
              )
          }

          const collectionMap = {
            chains: getComponent(),
            features: getFeature,
            layouts: getComponent(),
            sections: getComponent(React.Fragment)
          }

          const renderableItem = (node) => {
            const Component = collectionMap[node.collection]

            const Element = (Component)
              ? Component(node)
              : null

            return Element || (() => null)
          }

          const renderAll = (renderableItems) => {
            return (renderableItems || [])
              .map((ri, i) => renderableItem(ri, i))
              .filter(ri => ri)
          }

          return renderableItem(tree)
        }
      )

    Component.id = this.renderable.id
    if (tree.layout) {
      Component.layout = tree.layout
    }
    Component.tree = tree

    return Component
  }
}

QuarantineCompiler.prototype.loadComponent = loadComponent

module.exports = (renderable, outputType) =>
  new QuarantineCompiler(renderable, outputType).compile()
