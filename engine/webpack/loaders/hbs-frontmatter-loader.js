'use strict'

const hbsLoader = require('handlebars-loader')
const frontMatterLoader = require('yaml-frontmatter-loader')

function parse (source) {
  const json = frontMatterLoader.call(this, source)
  const { attributes, body } = JSON.parse(json)

  const callback = this.async()
  const hbsContext = Object.assign(
    {},
    this,
    {
      async: () => (err, result) => {
        if (!err && attributes && Object.keys(attributes).length) {
          result += `;module.exports=module.exports||{};Object.assign(module.exports,${JSON.stringify(attributes)})`
        }
        callback(err, result)
      }
    }
  )

  hbsLoader.call(hbsContext, body)
}

module.exports = parse
