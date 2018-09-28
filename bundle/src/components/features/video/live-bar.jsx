'use strict'

const React = require('react')

const headlineQuery = '{headlines{basic}}'

class LiveBar extends React.Component {
  constructor (props) {
    super(props)

    this.fetchContent({
      redskins: {
        source: 'content-api',
        key: { uri: '/sports/redskins/football-insider/aoeu-7' },
        filter: headlineQuery
      },
      mlb: {
        source: 'content-api',
        key: { uri: '/sports/mlb/new-blockquote-test' },
        filter: headlineQuery
      }
    })

    this.onButtonClick = this.onButtonClick.bind(this)
  }

  onButtonClick () {
    console.log('clicked')
  }

  render () {
    return <div className={this.props.type} id={this.props.id}>
      {this.props.customFields.headline}
      <p>
        {this.state && this.state.mlb && this.state.mlb.headlines.basic}
        <br />
        {this.state && this.state.redskins && this.state.redskins.headlines.basic}
      </p>
      <button onClick={this.onButtonClick}>click me</button>
    </div>
  }
}

module.exports = LiveBar
