'use strict'

import React from 'react'
import PropTypes from 'prop-types'

class Footer extends React.Component {
  constructor (props, context) {
    super(props, context)

    let uri = `/_content/${props.source || 'footer'}.json`

    // Shared Content Fetching
    this.state = context.fetch(uri, this, props.async)
  }

  render () {
    return <div className='footer'>{this.state && this.state.content}</div>
  }
}

Footer.contextTypes = {
  fetch: PropTypes.func
}

export default Footer
export { Footer }
