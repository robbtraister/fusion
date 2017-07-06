'use strict'

import React from 'react'

class Footer extends React.Component {
  constructor (props, context) {
    super(props)

    let uri = `/_content/${this.props.source || 'footer'}.json`

    // Synchronous Content Fetching
    this.state = context.fetch(uri, this) || {content: ''}

    // Asynchronous Content Fetching
    // context.async && context.async(uri).then(this.setState.bind(this))
    // context.async && context.async(uri, this)
  }

  render () {
    return <div className='footer'>{this.state.content}</div>
  }
}

Footer.contextTypes = {
  fetch: React.PropTypes.func
}

export default Footer
export { Footer }
