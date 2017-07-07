'use strict'

import React from 'react'
import PropTypes from 'prop-types'

class Footer extends React.Component {
  constructor (props, context) {
    super(props, context)

    let uri = `/_content/${this.props.source || 'footer'}.json`

    // Shared Content Fetching
    this.state = context.fetch && context.fetch(uri, this)
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
