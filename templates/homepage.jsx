'use strict'

const React = require('react')

const Body = require('../components/body.jsx')
const Header = require('../components/header.jsx')

const Template = props => {
  return <div id='body'>
    <Header />
    <Body>
      Homepage
    </Body>
  </div>
}

module.exports = Template
