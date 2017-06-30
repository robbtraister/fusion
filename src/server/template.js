'use strict'

const React = require('react')

const Template = (source, template, content, options) => {
  options = options || {}
  return <html>
    <head>
      {options.includeNoscript &&
        <noscript>
          <meta httpEquiv='refresh' content='0; url=?noscript' />
        </noscript>
      }
      {options.includeScripts &&
        <script src={`/_assets/engine.js`} defer='defer' />
      }
      {options.includeScripts && template &&
        <script src={`/_assets/templates/${template.toLowerCase()}.js`} defer='defer' />
      }

      <title>React Rendering Engine</title>

      <link rel='icon' type='image/png' sizes='96x96' href='/_assets/favicon-96x96.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/_assets/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/_assets/favicon-16x16.png' />
      <link rel='stylesheet' type='text/css' href={`/_assets/style.css`} />
    </head>
    <body>
      <div id='App' dangerouslySetInnerHTML={{ __html: content }} />
      {options.includeScripts && source &&
        <script src={`/_content/${source}.js?f=render`} defer='defer' />
      }
    </body>
  </html>
}

module.exports = Template
module.exports.Body = Template
