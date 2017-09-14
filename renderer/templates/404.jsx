'use strict'

const React = require('react')

const Body = require('../components/body')
const Banner = require('../components/banner')

const Template = props => {
  return (
    <div>
      <Banner />
      <Body>
        <noscript id='404'>
          <div>This page cannot be found</div>
        </noscript>
      </Body>
    </div>
  )
}

module.exports = Template
