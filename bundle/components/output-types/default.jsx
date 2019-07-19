'use strict'

import React from 'react'

import './default.scss'

const Default = ({ App, Fusion, Libs, Styles }) => {
  return (
    <html>
      <head>
        <title>test</title>
        <Libs />
        <Styles />
      </head>
      <body>
        <App />
        <Fusion />
      </body>
    </html>
  )
}

export default Default
