'use strict'

/* global fetch */

import React from 'react'

class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {content: ''}
/*
    let store = this.context.store

    if (!store.hasOwnProperty(uri)) {
      store[uri] = Promise.resolve(uri)
        .then(data => { store[uri] = data })
    } else if (store[uri] instanceof Promise) {
      this.state = {content: ''}
    } else {
      this.state = store[uri]
    }
*/
    let uri = `/_content/${this.props.source || 'footer'}.json`
    if (typeof fetch !== 'undefined') {
      fetch(uri)
        .then(res => res.json())
        .then(this.setState.bind(this))
    }
  }

  render () {
    return <div className='footer'>{this.state.content}</div>
  }
}

export default Footer
export { Footer }
