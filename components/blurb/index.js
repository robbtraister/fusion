import React from 'react'

const Blurb = (props) => {
  return <div className='blurb' key={props.id}>{props[props.property]}</div>
}

export default Blurb
export { Blurb }
