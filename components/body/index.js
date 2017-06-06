import React from 'react'

const Body = (id, content) => {
  return <div className='body' key={id}>{content.html}</div>
}

export default Body
export { Body }
