'use strict'

const React = require('react')

module.exports = context => props => {
  const __html = `document.addEventListener('DOMContentLoaded',function(){Fusion&&Fusion.render&&Fusion.render(${JSON.stringify(
    { ...context, tree: undefined }
  )})});`

  return React.createElement('script', {
    // defer: true,
    dangerouslySetInnerHTML: { __html }
  })
}
