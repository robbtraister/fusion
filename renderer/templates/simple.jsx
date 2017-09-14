'use strict'

const React = require('react')

const Banner = require('../components/banner')
const Body = require('../components/body')

const Template = props => {
  return (
    <div>
      <Banner />
      <Body>
        {props.content}
      </Body>
    </div>
  )
}

module.exports = Template
