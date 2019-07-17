'use strict'

function getExternal (commonjs, root) {
  return {
    commonjs,
    commonjs2: commonjs,
    root,
    var: root
  }
}

module.exports = {
  history: getExternal(require.resolve('history'), 'History'),
  'prop-types': getExternal(require.resolve('prop-types'), 'PropTypes'),
  react: getExternal(require.resolve('react'), 'React'),
  'react-dom': getExternal(require.resolve('react-dom'), 'ReactDOM'),
  'react-dom/server': getExternal(require.resolve('react-dom/server')),
  'react-router-dom': getExternal(require.resolve('react-router-dom'), 'ReactRouterDOM')
}
