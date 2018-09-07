'use strict'

const fs = require('fs')

const isStatic = require('../is-static')
const unpack = require('../../../utils/unpack')

const {
  minify
} = require('../../../../environment')

const { components } = require('../../../../environment/manifest')

const getTree = require('../../shared/compile/tree')

const srcFileType = (minify) ? 'src' : 'dist'

function fileExists (fp) {
  try {
    fs.accessSync(fp, fs.constants.R_OK)
    return true
  } catch (e) {}
  return false
}

function componentCss (name, config) {
  const fp = config.css
  return (fp && fileExists(fp))
    ? `require('${fp}')`
    : ''
}

function generateSource (renderable, outputType) {
  const usedComponents = {}
  const types = {}

  function componentImport (name, config) {
    try {
      const Component = unpack(require(config.dist))
      if (Component) {
        const fp = config[srcFileType]
        return (isStatic(Component, outputType))
          ? `Fusion.components${name} = Fusion.components.Static`
          : (name.startsWith(`['layouts']`))
            ? `Fusion.components${name} = Fusion.components.Layout(Fusion.unpack(require('${fp}')))`
            : `Fusion.components${name} = Fusion.unpack(require('${fp}'))`
      }
    } catch (e) {
    }
  }

  const getComponentConfig = function getComponentConfig (type, id) {
    const componentConfig = components[type][id]
    const componentOutputType = componentConfig && (componentConfig.outputTypes[outputType] || componentConfig.outputTypes.default)
    return componentOutputType
  }

  function getComponentName (type, id) {
    const key = `['${type}']['${id}']`
    if (key in usedComponents) {
      return usedComponents[key] ? key : null
    } else {
      const config = getComponentConfig(type, id)
      if (config) {
        types[type] = true
        usedComponents[key] = config
        return key
      } else {
        usedComponents[key] = null
      }
    }
  }

  function getFeature (config) {
    const componentName = getComponentName(config.collection, config.props.type)
    if (componentName) {
      const component = `Fusion.components${componentName}`
      return `React.createElement(${component}, ${JSON.stringify(config.props)})`
    } else {
      const props = {
        key: config.props.id,
        type: config.props.type,
        id: config.props.id,
        name: config.props.name,
        dangerouslySetInnerHTML: { __html: `<!-- feature "${config.props.type}" could not be found -->` }
      }
      return `React.createElement('div', ${JSON.stringify(props)})`
    }
  }

  function getChain (config) {
    const componentName = getComponentName(config.collection, config.props.type)
    const component = (componentName)
      ? `Fusion.components${componentName}`
      : `'div'`

    return `React.createElement(${component}, ${JSON.stringify(config.props)}, [${config.children.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  function getSection (config) {
    const component = `React.Fragment`
    return `React.createElement(${component}, ${JSON.stringify(config.props)}, [${config.children.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  function getLayout (config) {
    const componentName = getComponentName(config.collection, config.props.type)
    const component = (componentName)
      ? `Fusion.components${componentName}`
      : `'div'`

    return `React.createElement(${component}, ${JSON.stringify(config.props)}, [${config.children.map(renderableItem).join(',')}])`
  }

  function renderableItem (config, index) {
    const Component = {
      chains: getChain,
      features: getFeature,
      layouts: getLayout,
      sections: getSection
    }[config.collection]

    return (Component)
      ? Component(config)
      : ''
  }

  const Template = renderableItem(getTree(renderable))

  const usedComponentKeys = Object.keys(usedComponents).filter(k => usedComponents[k]).sort()

  const script = `'use strict'
const React = require('react')
window.Fusion = window.Fusion || {}
Fusion.components = Fusion.components || {}
${Object.keys(types).map(t => `Fusion.components.${t} = Fusion.components.${t} || {}`).join('\n')}
${usedComponentKeys.map(k => componentImport(k, usedComponents[k])).join('\n')}
Fusion.Template = function (props) {
  return React.createElement(React.Fragment, {}, ${Template})
}
Fusion.Template.layout = ${renderable.layout ? `'${renderable.layout}'` : 'null'}
module.exports = Fusion.Template
`

  const styles = `'use strict'
${usedComponentKeys.map(k => componentCss(k, usedComponents[k])).join('\n')}
`

  return Promise.resolve({script, styles})
}

module.exports = generateSource
