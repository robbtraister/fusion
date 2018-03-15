'use strict'

const React = require('react')
const Consumer = require('consumer')

const headlineQuery = '{headlines{basic}}'

class LiveBar extends React.Component {
  componentWillMount () {
    this.setContent({
      mlb: this.getContent('content-api', {uri: '/sports/mlb/new-blockquote-test'}, headlineQuery),
      redskins: this.getContent('content-api', {uri: '/sports/redskins/football-insider/aoeu-7'}, headlineQuery)
    })
  }

  render () {
    return <div className={this.props.type} id={this.props.id}>
      {this.props.headline}
      <p>
        {this.state && this.state.mlb && this.state.mlb.headlines.basic}
        <br />
        {this.state && this.state.redskins && this.state.redskins.headlines.basic}
      </p>
    </div>
  }
}

module.exports = Consumer(LiveBar)
