'use strict'

const React = require('react')

const Template = props => {
  return <div id='body'>
    {props.body || 'React Body'}
  </div>
}

module.exports = Template
