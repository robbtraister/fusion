'use strict'

import React from 'react'
import Consumer from 'Consumer'

// @Consumer
const Footer = Consumer(
class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.fetch(`/_/content/${props.source}.json`, props.async)
  }

  /*
  componentWillMount () {
    this.fetch(`/_content/${this.props.source}.json`, this.props.async)
  }
  */

  render () {
    return <div className='footer'>{this.state.content}</div>
  }
}
)

Footer.defaultProps = {
  source: 'footer'
}

export default Footer
export { Footer }
