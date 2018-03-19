'use strict'

const React = require('react')

const Layout = (Template) => (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      <script type='text/javascript' src='/pb/api/v3/resources/engine/react.js' />
      <script type='text/javascript' src='/pb/api/v3/compile/page/pdhHhQ1hVAO1iq' />
    </head>
    <body>
      <div id='App'>
        <Template {...props} />
      </div>
    </body>
  </html>

module.exports = Layout
