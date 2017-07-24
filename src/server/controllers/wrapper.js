'use strict'

const React = require('react')
const ReactDOMServer = require('react-dom/server')

const Wrapper = (rendering, html) => {
  return <html>
    <head>
      {!rendering.options.hydrated &&
        <noscript>
          <meta httpEquiv='refresh' content='0; url=?noscript' />
        </noscript>
      }
      {rendering.options.includeScripts &&
        <script src={`/_/assets/engine.js`} defer='defer' />
      }
      {rendering.options.includeScripts &&
        <script src={`/_/template?uri=${rendering.uri}`} defer='defer' />
      }

      <title>React Rendering Engine</title>

      <link rel='icon' type='image/png' sizes='96x96' href='/_/assets/favicon-96x96.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/_/assets/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/_/assets/favicon-16x16.png' />
      <link rel='stylesheet' type='text/css' href='/_/assets/style.css' />
    </head>
    <body>
      <div id='App' dangerouslySetInnerHTML={{ __html: html }} />
      {rendering.options.includeScripts &&
        <script src={`/_/content?f=render&uri=${rendering.uri}`} defer='defer' />
      }
    </body>
  </html>
}

function render (rendering, html) {
  return Promise.resolve(
    ReactDOMServer.renderToStaticMarkup(
      Wrapper(rendering, html || '')
    )
  )
}

module.exports = render
