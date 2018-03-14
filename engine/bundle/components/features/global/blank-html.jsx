'use strict'

const React = require('react')

const BlankHtml = (props) => <div className={props.type} id={props.id} dangerouslySetInnerHTML={{__html: props.rawHTML}} />

module.exports = BlankHtml
