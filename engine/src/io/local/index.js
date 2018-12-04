'use strict'

const path = require('path')

const {
  readFile,
  writeFile
} = require('../../utils/promises')

const { distRoot, mongoUrl } = require('../../../environment')

const { getModel } = require('./dao')(mongoUrl)

async function fetchTemplateHash (id) {
  try {
    return require(path.resolve(distRoot, `${id}.json`)).hash
  } catch (e) {}
}

module.exports = {
  ...require('../_shared'),

  fetchTemplateHash,

  async fetchTemplateStyles (id) {
    const hash = await fetchTemplateHash(id)
    return readFile(path.resolve(distRoot, 'styles', `${hash}.css`))
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

  async putCompilation (id, { hash, script, scriptMap, styles, stylesMap }) {
    return Promise.all([
      writeFile(path.resolve(distRoot, 'styles', `${hash}.css`), styles),
      stylesMap && writeFile(path.resolve(distRoot, 'styles', `${hash}.css.map`), stylesMap),
      writeFile(path.resolve(distRoot, `${id}.js`), script),
      scriptMap && writeFile(path.resolve(distRoot, `${id}.js.map`), scriptMap),
      writeFile(path.resolve(distRoot, `${id}.json`), JSON.stringify({ hash }))
    ])
  },

  // no-op on local
  putRender: async () => {},

  // no-op on local
  putRendering: async () => {},

  // no-op on local
  putResolvers: async () => {}
}
