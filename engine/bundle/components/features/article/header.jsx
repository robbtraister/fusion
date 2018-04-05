'use strict'

const React = require('react')
const Consumer = require('consumer')

const ArticleHeader = (props) =>
  <div className={props.type} id={props.id}>{props.requestUri}</div>

module.exports = Consumer(ArticleHeader)
