'use strict'

function getExternal (mod, root) {
  const commonjs = require.resolve(mod)
  return {
    commonjs,
    commonjs2: commonjs,
    root,
    var: root
  }
}

module.exports = {
  history: getExternal('history', 'History'),
  'prop-types': getExternal('prop-types', 'PropTypes'),
  react: getExternal('react', 'React'),
  'react-dom': getExternal('react-dom', 'ReactDOM'),
  'react-router-dom': getExternal('react-router-dom', 'ReactRouterDOM'),
  '@robbtraister/fusion-components': getExternal('../src/fusion/components', 'FusionComponents'),
  '@robbtraister/fusion-components/app': getExternal('../src/fusion/components/app', ['FusionComponents', 'App']),
  '@robbtraister/fusion-components/tree': getExternal('../src/fusion/components/tree', ['FusionComponents', 'Tree']),

  // should only be used on the server
  'react-dom/server': getExternal('react-dom/server'),
  '@robbtraister/fusion-components/utils': getExternal('../src/fusion/components/utils')
}
