import React from 'react'

import Header from '../header'

const Body = (id, content) => {
  return <div className='body' key={id}>
    <Header />
    {content}
  </div>
}

export default Body
export { Body }
