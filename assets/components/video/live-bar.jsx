'use strict'

const React = require('react')

const LiveBar = (props) => {
  return <div id={props.featureId}>{props.headline}</div>
}

module.exports = LiveBar
