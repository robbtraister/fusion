import React from 'react'

const Footer = (props) => {
  return <div className='footer' key={props.id}>{props.content}</div>
}

export default Footer
export { Footer }
