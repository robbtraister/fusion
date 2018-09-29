'use strict'

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

  instance.isRequired = (props, propName, componentName) => {
    const prop = props[propName]
    if (!prop) {
      return new Error(`${propName} is required on ${componentName}`)
    }
    return instance(props, propName, componentName)
  }

  const args = !(options instanceof Object)
    ? { schemas: [options].concat(...moreSchemas) }
    : (options instanceof Array)
      ? { schemas: options.concat(...moreSchemas) }
      : options

  return taggablePrimitive(instance, 'contentConfig', args)
}
