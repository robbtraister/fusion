'use strict'

const React = require('react')

const NavItem = props => {
  const routePattern = props.uri ? new RegExp(`^${props.href}(\\?|#|$)`) : null
  return (
    <li className={'nav-item' + (routePattern && routePattern.test(props.uri) ? ' active' : '')}>
      <a className='nav-link' href={props.href}>{props.label}</a>
    </li>
  )
}

module.exports = NavItem
