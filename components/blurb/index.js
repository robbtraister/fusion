import React from 'react'

const Blurb = (id, content) => {
  return <div className='blurb' key={id}>{content}</div>
}

export default Blurb
export { Blurb }
