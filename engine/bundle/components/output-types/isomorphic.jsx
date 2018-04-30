'use strict'

const React = require('react')

// require(`../../resources/css/bootstrap.min.css`)

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.metaTag}
      {props.libs}
      <link rel='stylesheet' type='text/css' href={`${props.prefix}/resources/css/bootstrap.min.css`} />
      {props.cssLink}
      <link rel='icon' type='image/x-icon' href={`${props.prefix}/resources/img/favicon.ico`} />
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
      {props.fusion}
    </body>
  </html>

module.exports = OutputType
