'use strict'

/* global __FUSION_PROPERTIES_FILE__ */

const React = window.React = window.react = require('react')
window.ReactDOM = window.ReactDOM = require('react-dom')
window.PropTypes = require('@arc-fusion/prop-types')

const Fusion = window.Fusion = window.Fusion || {}
Fusion.components = Fusion.components || {}
Fusion.components.Consumer = require('../components/consumer')
Fusion.components.Content = require('../components/content')
Fusion.components.Context = require('../components/context')
Fusion.components.Layout = require('../components/layout')

Fusion.context = React.createContext('fusion')
try {
  Fusion.getProperties = require(__FUSION_PROPERTIES_FILE__)
} catch (err) {
  Fusion.getProperties = () => ({})
}
Fusion.unpack = require('../../_shared/unpack')
