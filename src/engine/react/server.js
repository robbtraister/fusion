'use strict'

const React = require('react')
const ReactDOMServer = require('react-dom/server')

const Provider = require('../../content/provider')

class CachedProvider extends Provider {
  render () {
    if (this.props.cache) {
      return <div>
        <script dangerouslySetInnerHTML={{ __html: `var contentCache=${JSON.stringify(this.props.cache)}` }} />
        {super.render()}
      </div>
    } else {
      return super.render()
    }
  }
}

const Template = (rendering) => {
  return <CachedProvider fetch={rendering.fetch} cache={rendering.options.includeScripts && rendering.cache}>
    <rendering.component {...rendering.content} />
  </CachedProvider>
}

function render (rendering) {
  return Promise.resolve(ReactDOMServer.renderToStaticMarkup(
    Template(rendering)
  ))
}

module.exports = render
