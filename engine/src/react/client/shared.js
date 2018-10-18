'use strict'

/* global __CONTEXT_PATH__ */

const React = window.react = require('react')
window.ReactDOM = require('react-dom')
window.PropTypes = require('@arc-fusion/prop-types')

const substitute = require('../shared/utils/substitute')

const Fusion = window.Fusion = window.Fusion || {}
Fusion.contextPath = __CONTEXT_PATH__

Fusion.components = Fusion.components || {}
Fusion.components.Consumer = require('../shared/components/consumer')
Fusion.components.Content = require('../shared/components/content')
Fusion.components.Context = require('../shared/components/context')
Fusion.components.Layout = require('../shared/components/layout')
Fusion.components.Quarantine = require('../shared/components/quarantine')
Fusion.components.Static = require('../shared/components/static')
Fusion.properties = require('fusion:properties')
Fusion.unpack = require('../../utils/unpack')

Fusion.createElement = function (component, props, children) {
  return React.createElement(component, substitute(props, Fusion.globalContent), children)
}
