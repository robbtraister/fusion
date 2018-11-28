'use strict'

const hbsLoader = require('handlebars-loader')
const frontMatter = require('front-matter')

function parse (source) {
  const { attributes, body } = frontMatter(source)

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
