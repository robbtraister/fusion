'use strict'

import React from 'react'

import Blurb from '../../components/blurb'
import Body from '../../components/body'
import Footer from '../../components/footer'
import Header from '../../components/header'

const Article = (props) => {
  return <div className='article'>
    <Header />
    <Body>
      {(props.content || []).map((c, i) => <Blurb key={i} content={c} />)}
    </Body>
    <Footer source='blurb-footer' />
  </div>
}

export default Article
export { Article }
