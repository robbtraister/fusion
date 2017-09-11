'use strict'

const React = require('react')
const Consumer = require('consumer')

const NavItem = require('./nav-item')

class Header extends React.Component {
  render () {
    return (
      <nav className='navbar fixed-top navbar-expand navbar-dark bg-dark'>
        {/* <a className='navbar-brand' href='/'>
          Washington Post
        </a> */}
        <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon' />
        </button>
        <div className='collapse navbar-collapse' id='navbarNav'>
          <ul className='navbar-nav'>
            <NavItem label='Politics' href='/politics' uri={this.uri} />
            <NavItem label='Opinions' href='/opinions' uri={this.uri} />
            <NavItem label='Sports' href='/sports' uri={this.uri} />
            <NavItem label='Local' href='/local' uri={this.uri} />
            <NavItem label='National' href='/national' uri={this.uri} />
            <NavItem label='World' href='/world' uri={this.uri} />
          </ul>
        </div>
      </nav>
    )
  }
}

module.exports = Consumer(Header)
