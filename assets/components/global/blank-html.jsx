'use strict'

const React = require('react')

const BlankHtml = (props) => {
  return <div id={props.featureId} dangerouslySetInnerHTML={{__html: props.rawHTML}} />
}

module.exports = BlankHtml
