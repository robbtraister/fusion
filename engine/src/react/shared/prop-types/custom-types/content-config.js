'use strict'

const isRequired = require('../is-required')
const { taggablePrimitive } = require('../taggables')

module.exports = (options, ...moreSchemas) => {
  const instance = (props, propName, componentName) => {
    const prop = props[propName]
    if (prop) {
      if (!(props.sourceName || prop.source || prop.contentService)) {
        return new Error(`${propName} is missing property 'contentService' on ${componentName}`)
      }
      if (!(prop.key || prop.contentConfigValues)) {
        return new Error(`${propName} is missing property 'contentConfigValues' on ${componentName}`)
      }
    }
  }

  instance.isRequired = isRequired(instance)

  const args = !(options instanceof Object)
    ? { schemas: [options].concat(...moreSchemas) }
    : (options instanceof Array)
      ? { schemas: options.concat(...moreSchemas) }
      : options

  return taggablePrimitive(instance, 'contentConfig', args)
}
