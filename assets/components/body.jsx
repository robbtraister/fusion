'use strict'

const React = require('react')

const Breaking = require('./breaking')
const InTheNews = require('./in-the-news')
const Title = require('./title')

const Body = props => (
  <div id='App' style={{margin: '66px 30px 30px'}}>
    <Breaking />
    <Title />
    <InTheNews />
    {props.children}
  </div>
)

module.exports = Body
