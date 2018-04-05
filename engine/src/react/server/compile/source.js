'use strict'

const fs = require('fs')
const path = require('path')

const componentRoot = path.resolve(process.env.COMPONENT_ROOT || `${__dirname}/../../../../bundle/components`)

function getComponentFile (type, id) {
  return `${componentRoot}/${type}/${id}.jsx`
}

function componentImport (fp, name) {
  return `Fusion.Components${name} = require('${fp}')`
}

function generateFile (rendering, useComponentLib) {
  const components = {}
  const types = {}

  function getComponentName (type, id) {
    const key = getComponentFile(type, id)
    try {
      fs.accessSync(key, fs.constants.R_OK)
      types[type] = true
      components[key] = components[key] || `['${type}']['${id}']`
      return components[key]
    } catch (e) {
      // do nothing
    }
  }

  function feature (config) {
    const componentName = getComponentName('features', config.featureConfig.id || config.featureConfig)
    if (componentName) {
      const contentConfig = config.contentConfig || {}
      const customFields = config.customFields || {}

      const props = Object.assign({key: config.id, id: config.id, type: config.featureConfig.id || config.featureConfig}, customFields, contentConfig, {contentConfigValues: contentConfig.contentConfigValues})

      return `React.createElement(Fusion.Components${componentName}, ${JSON.stringify(props)})`
    }
  }

  function chain (config) {
    const componentName = getComponentName('chains', config.chainConfig.id || config.chainConfig)
    const component = (componentName)
      ? `Fusion.Components${componentName}`
      : `'div'`
    return `React.createElement(${component}, { key: '${config.id}', id: '${config.id}', type: '${config.chainConfig.id || config.chainConfig}' }, [${config.features.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  function section (config, index) {
    return `React.createElement('section', { key: ${index} }, [${config.renderableItems.map(renderableItem).filter(ri => ri).join(',')}])`
  }

  // function template (config) {
  //   return `[${config.layoutItems.map((item, i) => layout(item, rendering.layout && rendering.layout.sections && rendering.layout.sections[i])).join(',')}]`
  // }

  function template (config) {
    const componentName = getComponentName('layouts', config.layout)
    const componentRef = (componentName)
      ? `Fusion.Components${componentName}`
      : 'div'

    return `React.createElement(${componentRef}, {key: '${config.id || config._id}', id: '${config.id || config._id}'}, [${config.layoutItems.map(renderableItem).join(',')}])`
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
          : (config.layoutItems) ? template(config)
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
