import React from 'react'

class Link extends React.Component {
  render () {
    return <a className='link' key={this.props.id} href={this.props.href}>{this.props.text}</a>
  }
}

export default Link
export { Link }
