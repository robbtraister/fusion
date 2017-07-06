'use strict'

import React from 'react'
import PropTypes from 'prop-types'

class Footer extends React.Component {
  constructor (props, context) {
    super(props)

    let uri = `/_content/${this.props.source || 'footer'}.json`

    // Shared Content Fetching
    this.state = context.fetch(uri, this) || {content: ''}
  }

  render () {
    return <div className='footer'>{this.state.content}</div>
  }
}

Footer.contextTypes = {
  fetch: PropTypes.func
}

export default Footer
export { Footer }
