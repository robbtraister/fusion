'use strict'

const React = require('react')

const Body = require('../components/body')
const Header = require('../components/header')

const Template = props => {
  return (
    <div>
      <Header />
      <Body>
        <noscript id='404'>
          <div>This page cannot be found</div>
        </noscript>
      </Body>
    </div>
  )
}

module.exports = Template
