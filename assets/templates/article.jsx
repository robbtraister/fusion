'use strict'

const React = require('react')

const Article = require('../components/article')
const Wrapper = require('../components/wrapper')
const Test = require('../components/test')

const Template = props => {
  return (
    <Wrapper>
      <Article content={props.content || 'Homepage'} title='Article' author='abc' />
      <Test content='/_content/sync' />
      <Test async content='/_content/async' />
    </Wrapper>
  )
}

module.exports = Template
