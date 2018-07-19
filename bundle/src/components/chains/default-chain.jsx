'use strict'

const React = require('react')

const DefaultChain = (props) => {
  return <div className='default-chain' id={props.id}>{props.children}</div>
}

module.exports = DefaultChain
