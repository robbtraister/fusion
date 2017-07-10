'use strict'

import React from 'react'
import Consumer from '../consumer'

// @Consumer
const Footer = Consumer(
class Footer extends React.Component {
  componentWillMount () {
    this.fetch(`/_content/${this.props.source || 'footer'}.json`, this.props.async)
  }

  render () {
    return <div className='footer'>{this.state.content}</div>
  }
}
)

export default Footer
export { Footer }
