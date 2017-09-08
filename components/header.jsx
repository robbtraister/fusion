'use strict'

const React = require('react')
const Consumer = require('consumer')

class Header extends React.Component {
  render () {
    return (
      <div>
        <nav className='navbar navbar-expand navbar-dark bg-dark'>
          <a className='navbar-brand' href='/'>
            Washington Post
          </a>
          <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
            <span className='navbar-toggler-icon' />
          </button>
          <div className='collapse navbar-collapse' id='navbarNav'>
            <ul className='navbar-nav'>
              {/* <li className={'nav-item' + (/^\/sports(\?|#|$)/.test(this.uri) ? ' active' : '')}>
                <a className='nav-link' href='/sports'>Sports</a>
              </li> */}
            </ul>
          </div>
        </nav>
        <ul className='nav'>
          <li className='nav-item'>
            <a className='nav-link' href='/business'>Business</a>
          </li>
          <li className='nav-item'>
            <a className='nav-link' href='/politics'>Politics</a>
          </li>
          <li className='nav-item'>
            <a className='nav-link' href='/regional'>Regional</a>
          </li>
          <li className='nav-item'>
            <a className='nav-link' href='/sports'>Sports</a>
          </li>
        </ul>
      </div>
    )
  }
}

module.exports = Consumer(Header)
