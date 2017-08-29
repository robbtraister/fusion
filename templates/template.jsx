'use strict'

const React = require('react')

const Test = require('./components/test.jsx')

const Template = props => {
  return <div id='body'>
    {props.body || 'React Body'}
    <Test content='/_content/sync' />
    <Test async content='/_content/async' />
  </div>
}

module.exports = Template
