'use strict'

const React = require('react')

const Layout = Component => props => {
  return <html>
    <head>
      <script src='/_assets/engine.js' defer='defer' />
      <script src={`/_template${props.uri}`} is onerror='notFound()' defer='defer' />
      <script src={`/_content${props.uri}?v=content`} is onerror='notFound()' defer='defer' />

      <title>{props.title || 'React Layout'}</title>

      {/* <link rel='icon' type='image/png' sizes='96x96' href='/_assets/favicon-96x96.png' /> */}
      {/* <link rel='icon' type='image/png' sizes='32x32' href='/_assets/favicon-32x32.png' /> */}
      {/* <link rel='icon' type='image/png' sizes='16x16' href='/_assets/favicon-16x16.png' /> */}
      {/* <link rel='stylesheet' type='text/css' href='/_assets/style.css' /> */}
    </head>
    <body is onload='render(content)'>
      <div id='App'>
        {Component && <Component {...props} />}
      </div>
    </body>
  </html>
}

module.exports = Layout
