'use strict'

const React = require('react')

require(`../../resources/css/bootstrap.min.css`)

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.metaTag}
      {props.libs}
      {props.cssLinks}
      <link rel='icon' type='image/x-icon' href={`${props.contextPath}/resources/img/favicon.ico`} />
    </head>
    <body>
      <div id='fusion-app'>
        {props.children}
      </div>
      {props.fusion}
    </body>
  </html>

module.exports = OutputType
