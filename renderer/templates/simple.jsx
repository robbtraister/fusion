'use strict'

const React = require('react')

const Body = require('../components/body')
const Header = require('../components/header')

const Template = props => {
  return (
    <div>
      <Header />
      <Body>
        {props.body}
      </Body>
    </div>
  )
}

module.exports = Template
