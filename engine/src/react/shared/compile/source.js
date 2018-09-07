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

function componentCss (config) {
  const fp = config.css
  return (fp && fileExists(fp))
    ? `require('${fp}')`
    : ''
}

function generateSource (renderable, outputType) {
  const collections = {}

  function getComponentConfig (collection, type) {
    const componentConfig = components[collection] && components[collection][type]
    const componentOutputType = componentConfig && (componentConfig.outputTypes[outputType] || componentConfig.outputTypes.default)
    return componentOutputType
  }

  function getComponentName (collection, type) {
    const typeCollection = collections[collection] = collections[collection] || {
      used: false,
      types: {}
    }

    const typeMap = typeCollection.types

    if (!(type in typeMap)) {
      const config = getComponentConfig(collection, type)
      if (config) {
        typeCollection.used = true
        typeMap[type] = {
          config,
          name: `['${collection}']['${type}']`
        }
      } else {
        typeMap[type] = false
      }
    }

    return typeMap[type] && typeMap[type].name
  }

  function componentImport (manifest) {
    try {
      const Component = unpack(require(manifest.dist))
      if (Component) {
        const componentName = getComponentName(manifest.collection, manifest.type)
        const fp = manifest[srcFileType]
        return (isStatic(Component, outputType))
          ? `Fusion.components${componentName} = Fusion.components.Static`
          : (manifest.collection === 'layouts')
            ? `Fusion.components${componentName} = Fusion.components.Layout(Fusion.unpack(require('${fp}')))`
            : `Fusion.components${componentName} = Fusion.unpack(require('${fp}'))`
      }
    } catch (e) {
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

  const collectionMap = {
    chains: getComponent(),
    features: getFeature,
    layouts: getComponent(),
    sections: getComponent('React.Fragment')
  }

  function renderableItem (config, index) {
    const Component = collectionMap[config.collection]

    return (Component)
      ? Component(config)
      : ''
  }

  const Template = renderableItem(getTree(renderable))

  const usedCollections = Object.keys(collections).filter(collection => collections[collection].used).sort()

  const script = `'use strict'
const React = require('react')
window.Fusion = window.Fusion || {}
Fusion.components = Fusion.components || {}
${usedCollections.map(collection => `Fusion.components['${collection}'] = Fusion.components['${collection}'] || {}`).join('\n')}
${usedCollections
    .map(collection =>
      Object.values(collections[collection].types)
        .map(componentType => componentImport(componentType.config))
        .join('\n')
    )
    .join('\n')
}
Fusion.Template = function (props) {
  return React.createElement(React.Fragment, {}, ${Template})
}
Fusion.Template.layout = ${renderable.layout ? `'${renderable.layout}'` : 'null'}
module.exports = Fusion.Template
`

  const styles = `'use strict'
${usedCollections
    .map(collection =>
      Object.values(collections[collection].types)
        .map(componentType => componentCss(componentType.config))
        .join('\n')
    )
    .join('\n')
}
`

  return Promise.resolve({script, styles})
}

module.exports = generateSource
