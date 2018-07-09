'use strict'

module.exports = {
  node: {
    'fusion:consumer': 'fusion:consumer',
    'fusion:static': 'fusion:static',
    'prop-types': 'prop-types',
    'react': 'react',
    'react-dom': 'react-dom'
  },
  // make direct references available as global variable
  // make indirect references available by name
  // Example:
  //   a feature will compile from `require('prop-types')` to `require('PropTypes')`
  //   a template will include that compiled feature and will need to exclude 'PropTypes' in compilation
  web: {
    'fusion:consumer': 'Fusion.components.Consumer',
    'Fusion.components.Consumer': 'Fusion.components.Consumer',
    'fusion:static': 'Fusion.components.Static',
    'Fusion.components.Static': 'Fusion.components.Static',
    'prop-types': 'PropTypes',
    'PropTypes': 'PropTypes',
    'react': 'react',
    'react-dom': 'ReactDOM',
    'ReactDOM': 'ReactDOM'
  }
}
