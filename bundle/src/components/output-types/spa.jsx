'use strict'

const React = require('react')

require(`../../resources/css/bootstrap.min.css`)

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      <props.MetaTag />
      <props.Libs />
      <props.CssLinks>
        {({outputTypeHref, templateHref}) =>
          <React.Fragment>
            <link rel='stylesheet' type='text/css' href={outputTypeHref} />
            <link rel='stylesheet' type='text/css' href={templateHref} id='template-style' />
          </React.Fragment>
        }
      </props.CssLinks>
      <link rel='icon' type='image/x-icon' href={`${props.contextPath}/resources/img/favicon.ico`} />
    </head>
    <body>
      <div id='fusion-app' />
      <props.Fusion />
    </body>
  </html>

module.exports = OutputType
