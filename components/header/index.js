import React from 'react'

const Header = (props) => {
  return <div className='header' key={props.id}>
    <a href='/'>The Washington Post</a>
  </div>
}

export default Header
export { Header }
