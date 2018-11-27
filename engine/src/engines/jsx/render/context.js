'use strict'

const _merge = require('lodash.merge')

const { compile } = require('../compile')

const {
  contextPath,
  deployment
} = require('../../../../environment')

const {
  getContentSource
} = require('../../../content')

const {
  fetchTemplateHash,
  fetchTemplateStyles
} = require('../../../io')

module.exports = ({ children, ...props }) => {
  const contentCache = {}
  const inlines = {}
  const promises = []

  function getContent ({ source, query, filter, inherit }) {
    const queryString = JSON.stringify(query)
    const sourceCache = contentCache[source] = contentCache[source] || {}
    if (!sourceCache.hasOwnProperty(queryString)) {
      const contentSource = getContentSource(source)
      const contentFetch = sourceCache[queryString] = {
        source: contentSource,
        cached: undefined,
        // default to true; it will be flipped later if no filter is provided
        isFiltered: true,
        fetched: contentSource.fetch(query)
          .then(({ data }) => {
            contentFetch.cached = data
            return data
          })
      }
      promises.push(contentFetch.fetched)
    }

    const contentFetch = sourceCache[queryString]
    contentFetch.fetched = contentFetch.fetched
      .then(async (data) => {
        if (contentFetch.isFiltered) {
          if (filter) {
            const filtered = await contentFetch.source.filter(filter, data)
            contentFetch.filtered = _merge(contentFetch.filtered || {}, filtered)
            return contentFetch.filtered
          } else {
            contentFetch.isFiltered = false
            contentFetch.filtered = data
          }
        }
        return data
      })

    promises.push(contentFetch.fetched)

    return sourceCache[queryString]
  }

  function getInlines (map) {
    return Object.assign(
      {},
      ...Object.keys(map)
        .map((key) => {
          if (!inlines[key]) {
            inlines[key] = {
              cached: {},
              fetched: map[key]()
                .then((result) => {
                  inlines[key].cached = result
                  return result
                })
            }
            promises.push(inlines[key].fetched)
          }
          return { [key]: inlines[key].cached }
        })
    )
  }

  return {
    contentCache,
    eventListeners: {},
    getContent,
    getInlines,
    getTemplateHash: async () => {
      const fetchedHash = await fetchTemplateHash(`${props.type}/${props.id}/${props.outputType}`)
      if (fetchedHash !== undefined) {
        return fetchedHash
      }

      const { hash: compiledHash } = await compile(props)
      return compiledHash
    },
    getTemplateStyles: async () => {
      const fetchedStyles = await fetchTemplateStyles(`${props.type}/${props.id}/${props.outputType}`)
      if (fetchedStyles !== undefined) {
        return fetchedStyles
      }

      const { styles: comiledStyles } = await compile(props)
      return comiledStyles
    },
    isPending () {
      return promises.length > 0
    },
    wait () {
      return Promise.all(promises)
    },
    props: {
      contextPath,
      deployment,
      ...props
    }
  }
}
