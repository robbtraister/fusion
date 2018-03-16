'use strict'

const path = require('path')

const componentRoot = path.resolve(process.env.COMPONENT_ROOT || `${__dirname}/../../../dist/components`)

function expandProperties (obj) {
  return Object.keys(obj)
    .filter(k => obj[k])
    .map(k => ` ${k}='${obj[k].toString().replace(/'/g, '&apos;')}'`).join('')
}

function generateFile (rendering) {
  const components = {}

  function componentImport (id, name) {
    return `const ${name} = require('${componentRoot}/${id}.jsx')`
  }

  function getComponentName (type, id) {
    const key = `${type}/${id}`
    components[key] = components[key] || id.replace(/^[a-z]/, (c) => c.toUpperCase()).replace(/-/g, '_').replace(/\//g, '__')
    return components[key]
  }

  function feature (config) {
    const componentName = getComponentName('features', config.featureConfig.id || config.featureConfig)

    const contentConfigValues = (config.contentConfig && config.contentConfig.contentConfigValues) || {}
    const customFields = config.customFields || {}

    return `<${componentName}${expandProperties(Object.assign({featureId: config.id}, customFields, contentConfigValues))} />`
  }

  function chain (config) {
    return `<div id="${config.chainConfig.id || config.chainConfig}">
${config.features.map(renderableItem).filter(ri => ri).join('\n')}
</div>
`
  }

  function section (config) {
    return config.renderableItems.map(renderableItem).filter(ri => ri).join('\n')
  }

  function template (config) {
    return config.layoutItems.map((item, i) => layout(item, rendering.layout && rendering.layout.sections[i])).join('\n')
  }

  function layout (item, config) {
    return `<div${config && config.id ? ` id='${config.id}'` : ''}${config && config.cssClass ? ` className='${config.cssClass}'` : ''}>
  ${renderableItem(item)}
</div>`
  }

  function renderableItem (config) {
    return (config.featureConfig) ? feature(config)
      : (config.chainConfig) ? chain(config)
        : (config.renderableItems) ? section(config)
          : (config.layoutItems) ? template(config)
            : ''
  }

  const Template = renderableItem(rendering)

  const contents = `'use strict'
const React = require('react')
${Object.keys(components).map(k => componentImport(k, components[k])).join('\n')}
class Template extends React.Component {
  render () {
    return <React.Fragment>
      ${Template}
    </React.Fragment>
  }
}
module.exports = Template`

  return Promise.resolve(contents)
}

module.exports = generateFile
