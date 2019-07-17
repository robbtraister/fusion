'use strict'

function getDescendants (node) {
  const children = [].concat((node && node.children) || [])
  return children.concat(...children.map(getDescendants))
}

module.exports = getDescendants
