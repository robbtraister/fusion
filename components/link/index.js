import React from 'react'

class Link extends React.Component {
  render (id, content) {
    return <a href={content.href}>{content.text}</a>
  }
}

export default Link
export { Link }
