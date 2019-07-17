'use strict'

const path = require('path')

const PropTypes = require('prop-types')
const React = require('react')

const App = require('../../components/app')

const {
  distRoot
} = require('../../../../env')

const components = require(path.join(distRoot, 'components', 'combinations'))

const getComponent = ({ collection, type }) => {
  try {
    return collection ? components[collection][type] : type
  } catch (_) {
    return React.Fragment
  }
}

module.exports = context => {
  const AppWrapper = props =>
    React.createElement(
      'div',
      {
        id: props.id || 'fusion-app'
      },
      React.createElement(
        App,
        {
          ...context,
          getComponent
        }
      )
    )

  AppWrapper.propTypes = {
    id: PropTypes.string
  }

  return AppWrapper
}
