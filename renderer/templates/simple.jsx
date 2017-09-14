'use strict'

const React = require('react')

const Wrapper = require('../components/wrapper')

const Template = props => {
  return (
    <Wrapper>
      {props.content}
    </Wrapper>
  )
}

module.exports = Template
