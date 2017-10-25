'use strict'

const React = require('react')

const Wrapper = require('../components/wrapper')

const Template = props => {
  return (
    <Wrapper>
      <noscript id='404'>
        <div>This page cannot be found</div>
      </noscript>
    </Wrapper>
  )
}

module.exports = Template
