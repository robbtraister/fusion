'use strict'

const React = require('react')
const Consumer = require('consumer')

class LiveBar extends Consumer {
  constructor (props, context) {
    super(props, context)

    this.state = {}

    this.getContentAs('mlb')('content-api', {uri: '/sports/mlb/new-blockquote-test'}, '{headlines{basic}}')

    const redskins = this.getContent('content-api', {uri: '/sports/redskins/football-insider/aoeu-7'}, '{headlines{basic}}')
    if (redskins instanceof Promise) {
      redskins.then(redskins => this.setState({redskins}))
    } else {
      this.state.redskins = redskins
    }
  }

  render () {
    return <div className={this.props.type} id={this.props.id}>
      {this.props.headline}
      <p>
        {this.state.mlb && this.state.mlb.headlines.basic}
        <br />
        {this.state.redskins && this.state.redskins.headlines.basic}
      </p>
    </div>
  }
}

module.exports = LiveBar
