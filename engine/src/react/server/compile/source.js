'use strict'

const fs = require('fs')
const path = require('path')

const isStatic = require('../utils/is-static')
const unpack = require('../../../utils/unpack')
const { LOG_TYPES, ...logger } = require('../../../utils/logger')

const {
  bundleRoot,
  minify
} = require('../../../../environment')

const { components } = require('../../../../manifest')

const ComponentCompiler = require('../../shared/compile/component')

const getTree = require('../../shared/compile/tree')

const srcFileType = (minify) ? 'src' : 'dist'

function fileExists (fp) {
  try {
    fs.accessSync(fp, fs.constants.R_OK)
    return true
  } catch (e) {}
  return false
}

function componentCss (fp) {
  return (fp && fileExists(fp))
    ? `require('${fp}')`
    : ''
}

function getComponentManifest (collection, type, outputType) {
  const componentConfig = components[collection] && components[collection][type]
  return (componentConfig && componentConfig.outputTypes[outputType]) || null
}

class SourceCompiler extends ComponentCompiler {
  constructor (renderable, outputType) {
    super(renderable, outputType)

    this.collections = {}
    this.collectionMap.sections = this.getComponent('React.Fragment')

    this.emptyElement = ''
  }

  componentImport (manifest) {
    try {
      const Component = unpack(require(path.join(bundleRoot, manifest.dist)))
      if (Component) {
        const componentName = this.getComponentName(manifest.collection, manifest.type)
        const fp = path.join(bundleRoot, manifest[srcFileType])
        return (isStatic(Component, manifest.outputType))
          ? `Fusion.components${componentName} = Fusion.components.Static`
          : (manifest.collection === 'layouts')
            ? `Fusion.components${componentName} = Fusion.components.Layout(Fusion.unpack(require('${fp}')))`
            : `Fusion.components${componentName} = Fusion.components.Quarantine(Fusion.unpack(require('${fp}')))`
      }
    } catch (error) {
      logger.logError({ logType: LOG_TYPES.COMPONENT, message: 'There was a problem attempting to import a component.', stackTrace: error.stack })
    }
  }

  getFeature (node) {
    const componentName = this.getComponentName(node.collection, node.type)
    if (componentName) {
      const Component = `Fusion.components${componentName}`
      return `React.createElement(${Component}, ${JSON.stringify(node.props)})`
    } else {
      const props = {
        key: node.props.id,
        type: node.props.type,
        id: node.props.id,
        name: node.props.name,
        dangerouslySetInnerHTML: { __html: `<!-- feature "${node.type}" could not be found -->` }
      }
      return `React.createElement('div', ${JSON.stringify(props)})`
    }
  }

  getComponent (defaultComponent = `'div'`) {
    return (node) => {
      const componentName = this.getComponentName(node.collection, node.type)
      const Component = (componentName)
        ? `Fusion.components${componentName}`
        : defaultComponent

      const props = (Component === 'React.Fragment')
        ? { key: node.props.key }
        : node.props
      return `React.createElement(${Component}, ${JSON.stringify(props)}, [${node.children.map(this.renderableItem.bind(this)).filter(ri => ri).join(',')}])`
    }
  }

  getComponentName (collection, type) {
    const typeCollection = this.collections[collection] = this.collections[collection] || {
      used: false,
      types: {}
    }

    const typeMap = typeCollection.types

    if (!(type in typeMap)) {
      const manifest = getComponentManifest(collection, type, this.outputType)
      if (manifest) {
        typeCollection.used = true
        typeMap[type] = {
          manifest,
          name: `['${collection}']['${type}']`
        }
      } else {
        typeMap[type] = false
      }
    }

    return typeMap[type] && typeMap[type].name
  }

  compile () {
    const tree = getTree(this.renderable, this.outputType)
    const Template = this.renderableItem(tree)

    const usedCollections = Object.keys(this.collections).filter(collection => this.collections[collection].used).sort()

    const script = `'use strict'
const React = require('react')
window.Fusion = window.Fusion || {}
Fusion.components = Fusion.components || {}
${usedCollections.map(collection => `Fusion.components['${collection}'] = Fusion.components['${collection}'] || {}`).join('\n')}
${usedCollections
    .map(collection =>
      Object.values(this.collections[collection].types)
        .filter(componentType => componentType)
        .map(componentType => this.componentImport(componentType.manifest))
        .join('\n')
    )
    .join('\n')
}
Fusion.Template = function (props) {
  return React.createElement(React.Fragment, {}, ${Template})
}
Fusion.Template.id = ${this.renderable.id ? `'${this.renderable.id}'` : 'null'}
Fusion.Template.layout = ${tree.type ? `'${tree.type}'` : 'null'}
module.exports = Fusion.Template
`

    const styles = `'use strict'
${usedCollections
    .map(collection =>
      Object.values(this.collections[collection].types)
        .filter(componentType => componentType)
        .map(componentType => componentCss(componentType.manifest.css))
        .join('\n')
    )
    .join('\n')
}
`

    return Promise.resolve({ script, styles })
  }
}

module.exports = (renderable, outputType) =>
  new SourceCompiler(renderable, outputType).compile()
