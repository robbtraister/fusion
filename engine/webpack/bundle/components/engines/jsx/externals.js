'use strict'

module.exports = () => ({
  externals: {
    '@arc-fusion/prop-types': '@arc-fusion/prop-types',
    'fusion:consumer': 'fusion:consumer',
    'fusion:content': 'fusion:content',
    'fusion:context': 'fusion:context',
    'fusion:environment': 'fusion:environment',
    'fusion:properties': 'fusion:properties',
    'prop-types': '@arc-fusion/prop-types',
    react: 'react',
    'react-dom': 'react-dom'
  }
})
