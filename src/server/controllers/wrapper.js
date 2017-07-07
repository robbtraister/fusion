'use strict'

const React = require('react')

class Provider extends require('../../engine/provider') {
  render () {
    if (this.props.cache) {
      return <div>
        <script dangerouslySetInnerHTML={{ __html: `var contentCache=${JSON.stringify(this.props.cache)}` }} />
        {super.render()}
      </div>
    } else {
      return super.render()
    }
  }
}

const Wrapper = (templateName, contentURI, options, Component, props, fetch, cache) => {
  options = options || {}
  return <html>
    <head>
      {options.includeNoscript &&
        <noscript>
          <meta httpEquiv='refresh' content='0; url=?noscript' />
        </noscript>
      }
      {options.includeScripts &&
        <script src={`/_assets/engine.js`} defer='defer' />
      }
      {options.includeScripts && templateName &&
        <script src={`/_assets/templates/${templateName.toLowerCase()}.js`} defer='defer' />
      }

      <title>React Rendering Engine</title>

      <link rel='icon' type='image/png' sizes='96x96' href='/_assets/favicon-96x96.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/_assets/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/_assets/favicon-16x16.png' />
      <link rel='stylesheet' type='text/css' href={`/_assets/style.css`} />
    </head>
    <body>
      <div id='App'>
        {Component &&
          <Provider fetch={fetch} cache={options.includeScripts && cache}>
            <Component {...props} />
          </Provider>
        }
      </div>
      {options.includeScripts && contentURI &&
        <script src={`/_content/${contentURI}.js?f=render`} defer='defer' />
      }
    </body>
  </html>
}

module.exports = Wrapper
module.exports.Wrapper = Wrapper
