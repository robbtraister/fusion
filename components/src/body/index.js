import React from 'react'

import Header from '../header'

const Body = (props) => {
  return <div className='body' key={props.id}>
    <Header />
    {props.content}
  </div>
}

export default Body
export { Body }
