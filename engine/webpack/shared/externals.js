'use strict'

module.exports = {
  node: {
    'prop-types': 'prop-types',
    'react': 'react',
    'react-dom': 'react-dom'
  },
  web: {
    // make direct references available as global variable
    'prop-types': 'PropTypes',
    // make indirect references available by name
    // Example:
    //   a feature will compile from `require('prop-types')` to `require('PropTypes')`
    //   a template will include that compiled feature and will need to exclude 'PropTypes' in compilation
    'PropTypes': 'PropTypes',
    'react': 'react',
    'react-dom': 'ReactDOM',
    'ReactDOM': 'ReactDOM'
  }
}
