'use strict'

module.exports = {
  node: {
    'fusion:consumer': 'fusion:consumer',
    'fusion:content': 'fusion:content',
    'fusion:context': 'fusion:context',
    'fusion:environment': 'fusion:environment',
    'fusion:layout': 'fusion:layout',
    'fusion:static': 'fusion:static',
    'fusion:properties': 'fusion:properties',
    'fusion:prop-types': 'fusion:prop-types',
    'prop-types': 'fusion:prop-types',
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
    'fusion:content': 'Fusion.components.Content',
    'Fusion.components.Content': 'Fusion.components.Content',
    'fusion:context': 'Fusion.components.Context',
    'Fusion.components.Context': 'Fusion.components.Context',
    'fusion:environment': '{}',
    'fusion:layout': 'Fusion.components.Layout',
    'Fusion.components.Layout': 'Fusion.components.Layout',
    'fusion:static': 'Fusion.components.Static',
    'Fusion.components.Static': 'Fusion.components.Static',
    'fusion:properties': 'Fusion.properties',
    'Fusion.properties': 'Fusion.properties',
    '@arc-fusion/prop-types': 'PropTypes',
    'fusion:prop-types': 'PropTypes',
    'prop-types': 'PropTypes',
    'PropTypes': 'PropTypes',
    'react': 'react',
    'react-dom': 'ReactDOM',
    'ReactDOM': 'ReactDOM'
  }
}