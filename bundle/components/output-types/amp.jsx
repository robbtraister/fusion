'use strict'

const React = require('react')

require(`../../resources/css/bootstrap.min.css`)

const OutputType = (props) =>
  <html amp='amp'>
    <head>
      <title>Fusion Rendering</title>
      {props.metaTag}
      {props.styles(({outputTypeStyles, templateStyles}) =>
        <style amp-custom='true'>
          {outputTypeStyles}
          {templateStyles}
        </style>
      )}
      {/* {props.styles} */}
      <link rel='icon' type='image/x-icon' href={`${props.contextPath}/resources/img/favicon.ico`} />
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
    </body>
  </html>

module.exports = OutputType
