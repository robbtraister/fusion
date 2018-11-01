'use strict'

const React = require('react')

const Content = require('fusion:content')

const headlineQuery = '{headlines{basic}}'

const HeadlineComponent = (content) => content && content.headlines.basic

class LiveBar extends React.Component {
  constructor (props) {
    super(props)

    this.onButtonClick = this.onButtonClick.bind(this)
  }

  onButtonClick () {
    console.log('clicked')
  }

  render () {
    return <div className={this.props.type} id={this.props.id}>
      {this.props.customFields.headline}
      <p>
        <Content source='content-api' contentConfigValues={{ uri: '/sports/mlb/new-blockquote-test' }} filter={headlineQuery}>
          {HeadlineComponent}
        </Content>
        <br />
        <Content source='content-api' contentConfigValues={{ uri: '/sports/redskins/football-insider/aoeu-7' }} filter={headlineQuery}>
          {HeadlineComponent}
        </Content>
      </p>
      <button onClick={this.onButtonClick}>click me</button>
    </div>
  }
}

module.exports = LiveBar
