import React from 'react'

const Header = (id) => {
  return <div className='header' key={id}>
    <a href='/'>The Washington Post</a>
  </div>
}

export default Header
export { Header }
