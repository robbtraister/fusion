'use strict'

const React = require('react')

const ArticleHeader = (props) =>
  <div className={props.type} id={props.id}>{props.requestUri}</div>

module.exports = ArticleHeader
