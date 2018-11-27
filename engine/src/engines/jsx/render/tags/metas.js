'use strict'

const React = require('react')

module.exports = (context) => {
  const { props } = context
  const metas = props.meta || {}

  function metaValue (name) {
    const meta = metas[name]
    return meta && meta.value
  }

  function MetaTag ({ name }) {
    return React.createElement(
      'meta',
      {
        key: name,
        name,
        value: metaValue(name)
      }
    )
  }

  return {
    MetaTag,
    MetaTags () {
      return React.createElement(
        React.Fragment,
        {},
        Object.keys(metas)
          .filter((name) => metas[name].html)
          .map((name) => MetaTag({ name }))
      )
    },
    metaValue
  }
}
