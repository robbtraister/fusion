'use strict'

const React = require('react')
const Consumer = require('consumer')

const ArticleHeader = (props, context) =>
  <div className={props.type} id={props.id}>{context.requestUri}</div>

module.exports = Consumer(ArticleHeader)
