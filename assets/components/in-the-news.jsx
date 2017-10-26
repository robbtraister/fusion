'use strict'

const React = require('react')

const Consumer = require('consumer')

const NavItem = require('./nav-item')

class InTheNews extends React.Component {
  constructor (props) {
    super(props)
    this.fetch(`/_content/in-the-news`)
  }

  render () {
    return this.state && this.state.content
      ? (
        <div>
          <hr style={{margin: 0, borderColor: '#000', borderWidth: '4px'}} />
          <ul className='nav'>
            {this.state.content.map(i => <NavItem key={i} label={i} />)}
          </ul>
          <hr style={{margin: 0, borderColor: '#000'}} />
        </div>
      )
      : <div />
  }
}

module.exports = Consumer(InTheNews)
