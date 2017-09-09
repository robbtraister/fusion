'use strict'

const React = require('react')

const Article = props => (
  <div className='row'>
    <div className='col-sm-8'>
      <div className='card'>
        <div className='card-body'>
          <h3 className='card-title'>{props.title}</h3>
          <h6 className='card-subtitle'>by {props.author}</h6>
          <p className='card-text'>{props.body}</p>
        </div>
      </div>
    </div>
  </div>
)

module.exports = Article
