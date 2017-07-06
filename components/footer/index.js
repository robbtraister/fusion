'use strict'

/* global fetch */

import React from 'react'

class Footer extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {content: ''}

    let uri = `/_content/${this.props.source || 'footer'}.json`

    // Synchronous Content Fetching
    if (typeof window === 'undefined') {
      if (context.data.hasOwnProperty(uri)) {
        if (!(context.data[uri] instanceof Promise)) {
          this.state = context.data[uri]
        }
      } else {
        context.data[uri] = fetch(uri)
          .then(res => res.json())
          .then(json => { context.data[uri] = json })
      }
    }

    // Asynchronous Content Fetching
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      fetch(uri)
        .then(res => res.json())
        .then(this.setState.bind(this))
    }
  }

  render () {
    return <div className='footer'>{this.state.content}</div>
  }
}

Footer.contextTypes = {
  data: React.PropTypes.object
}

export default Footer
export { Footer }
