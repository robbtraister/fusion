'use strict'

const fs = require('fs')

const isStatic = require('../is-static')
const unpack = require('../../../utils/unpack')

const { components } = require('../../../../environment/manifest')

function fileExists (fp) {
  try {
    fs.accessSync(fp, fs.constants.R_OK)
    return true
  } catch (e) {}
  return false
}

function componentCss (fp, name) {
  const cssFilePath = fp.replace(/\.js$/, '.css')
  return fileExists(cssFilePath)
    ? `require('${cssFilePath}')`
    : ''
}

function componentImport (fp, name) {
  return (fp === 'fusion:static')
    ? `Fusion.components${name} = Fusion.components.Static`
    : `Fusion.components${name} = Fusion.unpack(require('${fp}'))`
}

const getComponentFile = function getComponentFile (type, id, outputType) {
  try {
    const componentConfig = components[type][id]
    const componentOutputType = componentConfig.outputTypes[outputType] || componentConfig.outputTypes.default
    const Component = unpack(require(componentOutputType.dist))
    if (Component) {
      return (isStatic(Component, outputType))
        ? 'fusion:static'
        : componentOutputType.dist
    }
  } catch (e) {
  }
  return null
}

function generateSource (renderable, outputType) {
  const components = {}
  const types = {}

  function getComponentName (type, id) {
    const key = getComponentFile(type, id, outputType)
    if (key) {
      types[type] = true
      components[key] = components[key] || `['${type}']['${id}']`
      return components[key]
    }
  }

  function feature (config) {
    const key = config.id
    const type = config.featureConfig.id || config.featureConfig
    const id = config.id

    const componentName = getComponentName('features', type)
    if (componentName) {
      const component = `Fusion.components${componentName}`
      const contentConfig = config.contentConfig || {}
      const customFields = config.customFields || {}
      const localEdits = config.localEdits || {}

      const props = {
        key,
        id,
        type,
        customFields,
        contentConfig,
        localEdits
      }

      return `React.createElement(${component}, ${JSON.stringify(props)})`
    } else {
      return `React.createElement('div', ${JSON.stringify({key, type, id, dangerouslySetInnerHTML: { __html: `<!-- feature "${type}" could not be found -->` }})})`
    }
  }

  function chain (config) {
    const componentName = getComponentName('chains', config.chainConfig.id || config.chainConfig)
    const component = (componentName)
      ? `Fusion.components${componentName}`
      : `'div'`

    const props = {
      key: config.id,
      type: config.chainConfig,
      id: config.id
    }

    return `React.createElement(${component}, ${JSON.stringify(props)}, [${config.features.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  function section (config, index) {
    const component = `'section'`
    const props = {
      key: index,
      type: 'section',
      id: index
    }
    return `React.createElement(${component}, ${JSON.stringify(props)}, [${config.renderableItems.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  // function template (config) {
  //   return `[${config.layoutItems.map((item, i) => layout(item, rendering.layout && rendering.layout.sections && rendering.layout.sections[i])).join(',')}]`
  // }

  function layout (config) {
    const componentName = getComponentName('layouts', config.layout)
    const component = (componentName)
      ? `Fusion.components${componentName}`
      : `'div'`

    const props = {
      key: config.id || config._id,
      type: 'rendering',
      id: config.id || config._id
    }

    return `React.createElement(${component}, ${JSON.stringify(props)}, [${config.layoutItems.map(renderableItem).join(',')}])`
  }

  // function layout (item, config) {
  //   return `
  //     React.createElement(
  //       'div',
  //       {
  //         id: ${config && config.id},
  //         className: ${config && config.cssClass}
  //       },
  //       ${renderableItem(item)}
  //     )
  //   `
  // }

  function renderableItem (config, index) {
    return (config.featureConfig) ? feature(config)
      : (config.chainConfig) ? chain(config)
        : (config.renderableItems) ? section(config, index)
          : (config.layoutItems) ? layout(config)
            : ''
  }

  const Template = renderableItem(renderable)

  const contents = `'use strict'
const React = require('react')
window.Fusion = window.Fusion || {}
Fusion.components = Fusion.components || {}
${Object.keys(types).map(t => `Fusion.components.${t} = Fusion.components.${t} || {}`)}
${Object.keys(components).map(k => componentCss(k, components[k])).join('\n')}
${Object.keys(components).map(k => componentImport(k, components[k])).join('\n')}
Fusion.Template = function (props) {
  return React.createElement(React.Fragment, {}, ${Template})
}
module.exports = Fusion.Template
`

  return Promise.resolve(contents)
}

module.exports = generateSource
