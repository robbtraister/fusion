'use strict'

const isClient = typeof window !== 'undefined'

function getDescendants (node) {
  const children = [].concat((node && node.children) || [])
  return children.concat(...children.map(getDescendants))
}

module.exports = {
  getDescendants,
  isClient
}
