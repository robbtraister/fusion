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
  const collections = {}

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

  function getComponentConfig (collection, type) {
    const componentConfig = components[collection] && components[collection][type]
    const componentOutputType = componentConfig && (componentConfig.outputTypes[outputType] || componentConfig.outputTypes.default)
    return componentOutputType
  }

  function getComponentName (collection, type) {
    const key = `['${collection}']['${type}']`
    if (key in usedComponents) {
      return usedComponents[key] ? key : null
    } else {
      const config = getComponentConfig(collection, type)
      if (config) {
        collections[collection] = true
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

  const getComponent = (defaultComponent = `'div'`) => (config) => {
    const componentName = getComponentName(config.collection, config.props.type)
    const component = (componentName)
      ? `Fusion.components${componentName}`
      : defaultComponent
    return `React.createElement(${component}, ${JSON.stringify(config.props)}, [${config.children.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  const componentMap = {
    chains: getComponent(),
    features: getFeature,
    layouts: getComponent(),
    sections: getComponent('React.Fragment')
  }

  function renderableItem (config, index) {
    const Component = componentMap[config.collection]

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
${Object.keys(collections).map(collection => `Fusion.components.${collection} = Fusion.components.${collection} || {}`).join('\n')}
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
