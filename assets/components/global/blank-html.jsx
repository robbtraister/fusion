'use strict'

const React = require('react')

const BlankHtml = (props) => <div id={props.featureId} dangerouslySetInnerHTML={{__html: props.rawHTML}} />

module.exports = BlankHtml
