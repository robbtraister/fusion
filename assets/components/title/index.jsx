'use strict'

const React = require('react')

require('./style.css')

const Title = props => (
  <div className='container'>
    <div className='row justify-content-center'>
      <div className='col-6'>
        <a href='/' className='title'><h2 className='text-center'>The Washington Post</h2></a>
      </div>
    </div>
  </div>
)

module.exports = Title
