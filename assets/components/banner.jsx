'use strict'

const React = require('react')

const NavItem = require('./nav-item')

const sections = [
  'Politics',
  'Opinions',
  'Sports',
  'Local',
  'National',
  'World',
  'Vue'
]

const Banner = props => (
  <nav className='navbar fixed-top navbar-expand navbar-dark bg-dark'>
    {/* <a className='navbar-brand' href='/'>
      Washington Post
    </a> */}
    <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
      <span className='navbar-toggler-icon' />
    </button>
    <div className='collapse navbar-collapse' id='navbarNav'>
      <ul className='navbar-nav'>
        {sections.map(s => <NavItem key={s} label={s} />)}
      </ul>
    </div>
  </nav>
)

module.exports = Banner
