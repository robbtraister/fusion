'use strict'

function getAncestors (node) {
  return (node && node.children)
    ? node.children
      .concat(...node.children.map(getAncestors))
    : []
}

module.exports = (tree) =>
  [tree].concat(...getAncestors(tree))
