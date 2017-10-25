'use strict'

const React = require('react')

const NavItem = require('./nav-item')

const items = [
  'Hurricane Jose',
  'Irma',
  'Richard Branson'
]

const InTheNews = props => (
  <div>
    <hr style={{margin: 0, borderColor: '#000', borderWidth: '4px'}} />
    <ul className='nav'>
      {items.map(i => <NavItem label={i} />)}
    </ul>
    <hr style={{margin: 0, borderColor: '#000'}} />
  </div>
)

module.exports = InTheNews
