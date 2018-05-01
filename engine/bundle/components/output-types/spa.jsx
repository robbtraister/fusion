'use strict'

const React = require('react')

require(`../../resources/css/bootstrap.min.css`)

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.metaTag}
      {props.libs}
      {props.cssLinks(({outputTypeHref, templateHref}) =>
        <React.Fragment>
          <link rel='stylesheet' type='text/css' href={outputTypeHref} />
          <link rel='stylesheet' type='text/css' href={templateHref} id='template-style' />
        </React.Fragment>
      )}
      <link rel='icon' type='image/x-icon' href='/pb/resources/img/favicon.ico' />
    </head>
    <body>
      <div id='App' />
      {props.fusion}
    </body>
  </html>

module.exports = OutputType
