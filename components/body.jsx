'use strict'

const React = require('react')

const Body = props => (
  <div id='App' style={{margin: '20px'}}>
    {props.children}
  </div>
)

module.exports = Body
