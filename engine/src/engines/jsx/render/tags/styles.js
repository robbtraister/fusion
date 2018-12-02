'use strict'

const React = require('react')

const {
  getOutputTypeStyles
} = require('../../../../io')

module.exports = (context) => {
  const {
    getInlines,
    getTemplateHash,
    getTemplateStyles,
    props
  } = context

  const {
    contextPath,
    deployment,
    isAdmin,
    outputType
  } = props || {}

  function CssTags ({ outputType: includeOutputType, template: includeTemplate }) {
    if (isAdmin) {
      return null
    }

    const { cssLinks } = getInlines({
      cssLinks: async () => {
        const [outputTypeStyles, templateHash] = await Promise.all([
          (includeOutputType === false) ? undefined : getOutputTypeStyles(outputType),
          (includeTemplate === false) ? undefined : getTemplateHash()
        ])

        return {
          outputTypeHref: (outputTypeStyles) ? deployment(`${contextPath}/dist/components/output-types/${outputType}.css`) : null,
          templateHref: (templateHash) ? deployment(`${contextPath}/dist/styles/${templateHash}.css`) : null
        }
      }
    })

    const tags = []

    if (cssLinks.outputTypeHref) {
      tags.push(
        React.createElement(
          'link',
          {
            key: 'fusion-output-type-styles',
            id: 'fusion-output-type-styles',
            rel: 'stylesheet',
            type: 'text/css',
            href: cssLinks.outputTypeHref
          }
        )
      )
    }

    // even if template cssFile is null, add the link tag with no href
    // so it can be replaced by an updated template script later
    tags.push(
      React.createElement(
        'link',
        {
          key: 'fusion-template-styles',
          id: 'fusion-template-styles',
          rel: 'stylesheet',
          type: 'text/css',
          href: cssLinks.templateHref
        }
      )
    )

    return React.createElement(
      React.Fragment,
      {},
      tags
    )
  }

  function Styles ({ children, inline, outputType: includeOutputType, template: includeTemplate }) {
    if (isAdmin) {
      return null
    }

    if (inline === false) {
      return CssTags({ outputType: includeOutputType, template: includeTemplate })
    }

    const { styles } = getInlines({
      styles: async () => {
        const [outputTypeStyles, templateStyles] = await Promise.all([
          (includeOutputType === false) ? undefined : getOutputTypeStyles(),
          (includeTemplate === false) ? undefined : getTemplateStyles()
        ])

        return {
          outputTypeStyles,
          templateStyles
        }
      }
    })

    return (children)
      ? children(styles)
      : React.createElement(
        'style',
        {
          dangerouslySetInnerHTML: {
            __html: `${styles.outputTypeStyles || ''}${styles.templateStyles || ''}`
          }
        }
      )
  }

  return {
    CssLinks: CssTags,
    CssTags,
    Styles
  }
}
