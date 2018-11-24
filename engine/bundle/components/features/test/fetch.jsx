'use strict'

import React from 'react'

import Content from 'fusion:content'

export default (props) =>
  <Content source='fetch' query={{ response: 'abc' }}>
    {({ data }) => <div>{data}</div>}
  </Content>
