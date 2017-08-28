'use strict'

const React = require('react')

const Test = require('./components/test.jsx')

const Template = props => {
  return <div id='body'>
    {props.body || 'React Body'}
    <Test />
  </div>
}

module.exports = Template
