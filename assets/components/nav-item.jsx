'use strict'

const React = require('react')

const Consumer = require('consumer')

class NavItem extends React.Component {
  render () {
    const href = this.props.href || `/${this.props.label.replace(' ', '-').toLowerCase()}`
    const routePattern = this.uri ? new RegExp(`^${href}(\\?|#|$)`) : null
    return (
      <li className={'nav-item' + (routePattern && routePattern.test(this.uri) ? ' active' : '')}>
        <a className='nav-link' href={href}>{this.props.label}</a>
      </li>
    )
  }
}

module.exports = Consumer(NavItem)
