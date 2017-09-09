'use strict'

const React = require('react')

const Layout = Component => props => {
  return <html>
    <head>
      <title>{props.title || 'WaPo React'}</title>

      <script src='/_assets/jquery/js/jquery-3.2.1.min.js' defer='defer' />
      <script src='/_assets/bootstrap/js/bootstrap.min.js' defer='defer' />

      <script src='/_assets/react/engine.js' defer='defer' />
      <script src={`/_template${props.uri}`} is onerror='notFound()' defer='defer' />
      <script src={`/_content${props.uri}?v=content`} is onerror='notFound()' defer='defer' />

      <link rel='stylesheet' type='text/css' href='/_assets/bootstrap/css/bootstrap.min.css' />

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
