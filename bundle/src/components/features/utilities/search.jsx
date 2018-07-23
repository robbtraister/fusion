'use strict'

const React = require('react')

const Search = (props) =>
  <form className='search' action='/search/' method='GET'>
    <button id='search-button' className='magnifying-button'>
      <i className='fa fa-search' />
    </button>
    <input type='text-field' className='search-text-field' id='q' name='q' />
  </form>

module.exports = Search
