'use strict'

const React = require('react')
const Consumer = require('consumer')

const NavItem = require('./nav-item')

class InTheNews extends React.Component {
  render () {
    return (
      <div>
        <hr style={{margin: 0, borderColor: '#000', borderWidth: '4px'}} />
        <ul className='nav'>
          <NavItem label='Hurricane Jose' href='/hurricane-jose' uri={this.uri} />
          <NavItem label='Irma' href='/irma' uri={this.uri} />
          <NavItem label='Richard Branson' href='/richard-branson' uri={this.uri} />
        </ul>
        <hr style={{margin: 0, borderColor: '#000'}} />
      </div>
    )
  }
}

module.exports = Consumer(InTheNews)
