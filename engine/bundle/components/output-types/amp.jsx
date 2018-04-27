'use strict'

const React = require('react')

const css = require('../../resources/global.css')

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.metaTag}
      <style>
        {css}
      </style>
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
