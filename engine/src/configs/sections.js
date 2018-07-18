'use strict'

const Layout = require('../react/shared/components/layout')
const unpack = require('../utils/unpack')

function getSections (componentConfig) {
  const sectionIdsString = Object.values(componentConfig.outputTypes)
    .reduce((compilation, item) => {
      // ensure we load the latest version of the files
      delete require.cache[item.dist]
      const Component = Layout(unpack(require(item.dist)))
      const sections = Component.sections
      if (!sections) {
        throw new Error(`${componentConfig.type}/${componentConfig.id}: sections property is required`)
      }

      const sectionIds = ((sections instanceof Array))
        // unwrap ids, or just use the value if not objects
        ? sections.map((section) => section.id || section)
        : Object.keys(sections) || []

      const sectionIdsString = JSON.stringify(sectionIds)

      if (compilation === null || compilation === sectionIdsString) {
        return sectionIdsString
      }

      throw new Error(`${componentConfig.type}/${componentConfig.id}: sections has conflicts`)
    }, null)

  if (!sectionIdsString) {
    throw new Error(`${componentConfig.type}/${componentConfig.id}: sections property is required`)
  }

  return JSON.parse(sectionIdsString)
}

module.exports = getSections
