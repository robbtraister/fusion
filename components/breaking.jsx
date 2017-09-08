'use strict'

/* global $ */

const React = require('react')
const Consumer = require('consumer')

class Breaking extends React.Component {
  constructor (props) {
    super(props)
    this.async(props.content || `/_content/Breaking%20News`)
  }

  componentDidMount () {
    $('.alert').alert()
  }

  render () {
    return this.state && this.state.body
      ? (
        <div className='alert alert-secondary alert-dismissible' role='alert'>
          <button type='button' className='close' data-dismiss='alert' aria-label='Close'>
            <span aria-hidden='true'>&times;</span>
          </button>
          <strong>Breaking News:</strong> {this.state.body}
        </div>
      )
      : <div />
  }
}

module.exports = Consumer(Breaking)
