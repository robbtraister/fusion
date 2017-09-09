'use strict'

const React = require('react')

const Article = require('../components/article')
const Body = require('../components/body')
const Header = require('../components/header')
const Test = require('../components/test')

const Template = props => {
  return (
    <div>
      <Header />
      <Body>
        <Article body={props.body || 'Homepage'} title='Article' author='abc' />
        <Test content='/_content/sync' />
        <Test async content='/_content/async' />
      </Body>
    </div>
  )
}

module.exports = Template
