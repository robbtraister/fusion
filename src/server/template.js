'use strict'

const React = require('react')

const hashes = require('./hashes')

function appendHash (h) {
  return h ? `?h=${h}` : ''
}

const Template = (content, options) => {
  options = options || {}
  return <html>
    <head>
      {options.includeNoscript &&
        <noscript>
          <meta httpEquiv='refresh' content='0; url=?noscript' />
        </noscript>
      }
      {options.includeScripts &&
        <script src={`/engine.js${appendHash(hashes['/engine.js'])}`} />
      }
      {options.includeScripts &&
        <script src={`/components.js${appendHash(hashes['/components.js'])}`} />
      }

      <title>React Rendering Engine</title>

      <link rel='icon' type='image/png' sizes='96x96' href='/favicon-96x96.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='stylesheet' type='text/css' href={`/style.css${appendHash(hashes['/style.css'])}`} />
    </head>
    <body>
      <div id='App' dangerouslySetInnerHTML={{ __html: content }} />
    </body>
  </html>
}

module.exports = Template
module.exports.Body = Template
