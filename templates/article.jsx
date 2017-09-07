'use strict'

const React = require('react')

const Article = require('../components/article.jsx')
const Body = require('../components/body.jsx')
const Header = require('../components/header.jsx')
const Test = require('../components/test.jsx')

const Template = props => {
  return <div id='body'>
    <Header />
    <Body>
      <Article body={props.body || 'Homepage'} title='Article' author='abc' />
      <Test content='/_content/sync' />
      <Test async content='/_content/async' />
    </Body>
  </div>
}

module.exports = Template
