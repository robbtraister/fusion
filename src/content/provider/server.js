'use strict'

const React = require('react')
const ClientProvider = require('./client')

class ServerProvider extends ClientProvider {
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

module.exports = ServerProvider
