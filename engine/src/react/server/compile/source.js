'use strict'

const fs = require('fs')

const isStatic = require('../is-static')
const unpack = require('../../../utils/unpack')

const {
  minify
} = require('../../../../environment')

const { components } = require('../../../../environment/manifest')

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
      const displayProperties = (config.displayProperties || {})[outputType] || {}

      const props = {
        key,
        id,
        type,
        customFields,
        contentConfig,
        displayProperties,
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

    const displayProperties = (config.displayProperties || {})[outputType] || {}

    const props = {
      key: config.id,
      type: config.chainConfig,
      id: config.id,
      displayProperties
    }

    return `React.createElement(${component}, ${JSON.stringify(props)}, [${config.features.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  function section (config, index) {
    const component = `React.Fragment`
    const props = {
      key: index
      // type: 'section',
      // id: index
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
      type: 'layout',
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
Fusion.Template.id = '${renderable.id}'
Fusion.Template.layout = ${renderable.layout ? `'${renderable.layout}'` : 'null'}
module.exports = Fusion.Template
`

  const styles = `'use strict'
${usedComponentKeys.map(k => componentCss(k, usedComponents[k])).join('\n')}
`

  return Promise.resolve({script, styles})
}

module.exports = generateSource
