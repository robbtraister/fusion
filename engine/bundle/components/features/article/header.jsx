'use strict'

const React = require('react')

const ArticleHeader = (props) => <div className={props.type} id={props.id} dangerouslySetInnerHTML={{__html: props.rawHTML}} />

module.exports = ArticleHeader
