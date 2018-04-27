'use strict'

const React = require('react')

const globalStyles = require(`../../resources/global.css`)

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.metaTag}
      {props.styles((templateStyles) =>
        <style amp-custom='true'>
          {globalStyles}
          {templateStyles}
        </style>
      )}
      <link rel='icon' type='image/x-icon' href='/pb/resources/favicon.ico' />
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
    </body>
  </html>

module.exports = OutputType
