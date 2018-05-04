'use strict'

const debugTimer = require('debug')('fusion:timer:react:component')

const React = require('react')

const timer = require('../../../timer')

const { componentDistRoot } = require('../../../../environment')

const componentFiles = [
  (componentType, componentName, outputType) => outputType ? `${componentDistRoot}/${componentType}/${componentName}/${outputType}.js` : null,
  (componentType, componentName, outputType) => `${componentDistRoot}/${componentType}/${componentName}/default.js`,
  (componentType, componentName, outputType) => `${componentDistRoot}/${componentType}/${componentName}/index.js`,
  (componentType, componentName, outputType) => `${componentDistRoot}/${componentType}/${componentName}.js`
]

const TimedComponent = (Component) => (props) => {
  const tic = timer.tic()
  const result = React.createElement(Component, props)
  debugTimer(`render(${props.type}:${props.id})`, tic.toc())
  return result
}

const loadComponent = function loadComponent (componentType, componentName, outputType) {
  for (let i = 0; i < componentFiles.length; i++) {
    try {
      return TimedComponent(require(componentFiles[i](componentType, componentName, outputType)))
    } catch (e) {}
  }
  return null
}

module.exports = require('../../shared/compile/component')(loadComponent)
