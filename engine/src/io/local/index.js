'use strict'

const path = require('path')

const {
  readFile,
  writeFile
} = require('../../utils/promises')

const modelFactory = require('./dao')

module.exports = (env) => {
  const { distRoot } = env

  const getModel = modelFactory(env)

  async function fetchTemplateHash (id) {
    try {
      return require(path.resolve(distRoot, `${id}.json`)).hash
    } catch (e) {}
  }

  return {
    fetchTemplateHash,

    async fetchTemplateStyles (id) {
      const hash = await fetchTemplateHash(id)
      return readFile(path.resolve(distRoot, 'styles', `${hash}.css`))
    },

    async getOutputTypeStyles (outputType) {
      try {
        return await readFile(path.resolve(distRoot, 'components', 'output-types', `${outputType}.css`))
      } catch (err) {}
    },

    async getRendering ({ type, id }) {
      const data = await getModel(type).get(id)

      if (type === 'rendering') {
        return {
          type,
          id,
          ...data
        }
      }

      // if page/template, we need to get the actual rendering object
      const version = data && data.published && data.versions && data.versions[data.published]
      const head = version && version.head
      if (head) {
        const rendering = await getModel('rendering').get(head)
        return {
          type,
          id,
          ...rendering
        }
      }
    },

    async putCompilation (id, { hash, script, styles }) {
      return Promise.all([
        writeFile(path.resolve(distRoot, 'styles', `${hash}.css`), styles),
        writeFile(path.resolve(distRoot, `${id}.js`), script),
        writeFile(path.resolve(distRoot, `${id}.json`), JSON.stringify({ hash }))
      ])
    }
  }
}
