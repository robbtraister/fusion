'use strict'

const React = require('react')

const Article = require('../components/article')
const Banner = require('../components/banner')
const Body = require('../components/body')
const Test = require('../components/test')

const Template = props => {
  return (
    <div>
      <Banner />
      <Body>
        <Article content={props.content || 'Homepage'} title='Article' author='abc' />
        <Test content='/_content/sync' />
        <Test async content='/_content/async' />
      </Body>
    </div>
  )
}

module.exports = Template
