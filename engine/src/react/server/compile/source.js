'use strict'

const fs = require('fs')

const { componentSrcRoot } = require('../../../environment')

function componentImport (fp, name) {
  return `Fusion.Components${name} = require('${fp}')`
}

const componentFiles = [
  (componentName, outputType) => outputType ? `${componentName}/${outputType}.jsx` : null,
  (componentName, outputType) => `${componentName}/default.jsx`,
  (componentName, outputType) => `${componentName}/index.jsx`,
  (componentName, outputType) => `${componentName}.jsx`
]

const getComponentFile = function getComponentFile (type, id, outputType) {
  for (let i = 0; i < componentFiles.length; i++) {
    try {
      const key = componentFiles[i](`${componentSrcRoot}/${type}/${id}`, outputType)
      fs.accessSync(key, fs.constants.R_OK)
      return key
    } catch (e) {}
  }
  return null
}

function generateFile (rendering, outputType, useComponentLib) {
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
    const componentName = getComponentName('features', config.featureConfig.id || config.featureConfig)
    if (componentName) {
      const component = `Fusion.Components${componentName}`
      const contentConfig = config.contentConfig || {}
      const customFields = config.customFields || {}
      const localEdits = config.localEdits || {}

      const props = {
        key: config.id,
        id: config.id,
        type: config.featureConfig,
        customFields,
        contentConfig,
        localEdits
      }

      return `React.createElement(${component}, ${JSON.stringify(props)})`
    }
  }

  function chain (config) {
    const componentName = getComponentName('chains', config.chainConfig.id || config.chainConfig)
    const component = (componentName)
      ? `Fusion.Components${componentName}`
      : `'div'`

    const props = {
      key: config.id,
      id: config.id,
      type: config.chainConfig
    }

    return `React.createElement(${component}, ${JSON.stringify(props)}, [${config.features.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  function section (config, index) {
    const component = `'section'`
    const props = {
      key: index,
      id: index,
      type: 'section'
    }
    return `React.createElement(${component}, ${JSON.stringify(props)}, [${config.renderableItems.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  // function template (config) {
  //   return `[${config.layoutItems.map((item, i) => layout(item, rendering.layout && rendering.layout.sections && rendering.layout.sections[i])).join(',')}]`
  // }

  function layout (config) {
    const componentName = getComponentName('layouts', config.layout)
    const component = (componentName)
      ? `Fusion.Components${componentName}`
      : `'div'`

    const props = {
      key: config.id || config._id,
      id: config.id || config._id,
      type: 'rendering'
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

  const Template = renderableItem(rendering)

  const contents = `'use strict'
${(useComponentLib)
    ? 'var React = React || window.react'
    : `
const React = require('react')
window.Fusion = window.Fusion || {}
Fusion.Components = Fusion.Components || {}
${Object.keys(types).map(t => `Fusion.Components.${t} = Fusion.Components.${t} || {}`)}
${Object.keys(components).map(k => componentImport(k, components[k])).join('\n')}
`
}
Fusion.Template = function (props) {
  return React.createElement(React.Fragment, {}, ${Template})
}
${(useComponentLib)
    ? ''
    : `
module.exports = Fusion.Template
`
}
`

  return Promise.resolve(contents)
}

module.exports = generateFile
