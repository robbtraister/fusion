'use strict'

const React = require('react')

const hashes = require('./hashes')

function hashedSource (s) {
  let h = hashes[s]
  return h ? `${s}?h=${h}` : s
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
        <script src={hashedSource('/engine.js')} />
      }

      <title>React Rendering Engine</title>

      <link rel='icon' type='image/png' sizes='96x96' href='/favicon-96x96.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='stylesheet' type='text/css' href={hashedSource('/style.css')} />
    </head>
    <body>
      <div id='App' dangerouslySetInnerHTML={{ __html: content }} />
    </body>
  </html>
}

module.exports = Template
module.exports.Body = Template
