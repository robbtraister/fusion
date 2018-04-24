'use strict'

const React = require('react')

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.meta}
      {props.css({inline: true})}
      <link rel='icon' type='image/x-icon' href='/pb/resources/favicon.ico' />
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
    </body>
  </html>

module.exports = OutputType
