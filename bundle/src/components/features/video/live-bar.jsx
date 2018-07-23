'use strict'

const React = require('react')

// const headlineQuery = '{headlines{basic}}'

class LiveBar extends React.Component {
  constructor (props) {
    super(props)
    this.onButtonClick = this.onButtonClick.bind(this)
  }
  // componentWillMount () {
  //   this.setContent({
  //     redskins: this.getContent('content-api', {uri: '/sports/redskins/football-insider/aoeu-7'}, headlineQuery)
  //   })
  // }

  // componentDidMount () {
  //   this.setContent({
  //     mlb: this.getContent('content-api', {uri: '/sports/mlb/new-blockquote-test'}, headlineQuery)
  //   })
  // }

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
