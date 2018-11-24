'use strict'

class ComponentLoader {
  createChildren (node) {
    const children = (node.children instanceof Array)
      ? node.children
      : (node.children)
        ? [node.children]
        : []

    return children.map(
      (child, index) =>
        this.createElement(
          {
            ...child,
            props: {
              key: index,
              ...child.props
            }
          }
        )
    )
  }

  createElement (node) {
    throw new Error('createElement not implemented')
  }

  loadComponent (node) {
    throw new Error('loadComponent not implemented')
  }
}

module.exports = ComponentLoader
