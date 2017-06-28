'use strict'

/* global fetch */

import React from 'react'

class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {content: ''}
  }

  componentWillMount () {
    if (typeof fetch !== 'undefined') {
      fetch(`/_content/${this.props.source || 'footer'}.json`)
        .then(res => res.json())
        .then(json => {
          this.setState(json)
        })
    }
  }

  render () {
    return <div className='footer'>{this.state.content}</div>
  }
}

export default Footer
export { Footer }
