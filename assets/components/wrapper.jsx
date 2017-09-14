'use strict'

const React = require('react')

const Banner = require('./banner')
const Breaking = require('./breaking')
const InTheNews = require('./in-the-news')
const Title = require('./title')

const Wrapper = props => (
  <div>
    <Banner />
    <div style={{margin: '66px 30px 30px'}}>
      <Breaking />
      <Title />
      <InTheNews />
      {props.children}
    </div>
  </div>
)

module.exports = Wrapper
