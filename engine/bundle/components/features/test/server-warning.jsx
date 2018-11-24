'use strict'

import React from 'react'

import './server-warning.scss'

const isClient = typeof window !== 'undefined'

export default (props) =>
  <div className={isClient ? '' : 'test_server-warning'}>{isClient ? 'looks good' : '!!! WARNING !!!'}</div>
