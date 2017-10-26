'use strict'

const React = require('react')

const Consumer = require('consumer')

class NavItem extends React.Component {
  render () {
    const href = this.props.href || `/${this.props.label.replace(' ', '-').toLowerCase()}`
    const active = this.uri ? (new RegExp(`^${href}(\\?|#|$)`)).test(this.uri) : false
    return (
      <li className={'nav-item' + (active ? ' active' : '')}>
        <a className='nav-link' href={href}>{this.props.label}</a>
      </li>
    )
  }
}

module.exports = Consumer(NavItem)
