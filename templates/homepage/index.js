'use strict'

import React from 'react'

import Body from '../../components/body'
import Footer from '../../components/footer'
import Header from '../../components/header'

const Homepage = (props) => {
  return <div className='homepage'>
    <Header />
    <Body>
      {props.content}
      <p />
      <a href='/blurbs'>Blurbs</a>
      <p />
      <a href='/section'>Section</a>
    </Body>
    <Footer async='true' />
  </div>
}

export default Homepage
export { Homepage }
