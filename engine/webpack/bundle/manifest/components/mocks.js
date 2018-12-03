'use strict'

const React = require('react')
const ReactDOM = require('react-dom')
const PropTypes = require('@arc-fusion/prop-types')

const mockRequire = require('mock-require')
mockRequire('react', React)
mockRequire('react-dom', ReactDOM)
mockRequire('prop-types', PropTypes)
mockRequire('fusion:prop-types', PropTypes)

mockRequire('fusion:consumer', () => {})
mockRequire('fusion:content', () => {})
mockRequire('fusion:context', () => {})
mockRequire('fusion:environment', {})
mockRequire('fusion:layout', () => {})
mockRequire('fusion:properties', {})
mockRequire('fusion:static', {})
