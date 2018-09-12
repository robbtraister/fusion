'use strict'

import React from 'react'

import PropTypes from 'prop-types'

require(`../../resources/css/bootstrap.min.css`)

const OutputType = (props) =>
  <html amp='amp'>
    <head>
      <title>Fusion Rendering</title>
      <props.MetaTags />
      <props.Styles>
        {({outputTypeStyles, templateStyles}) =>
          <style amp-custom='true'>
            {outputTypeStyles}
            {templateStyles}
          </style>
        }
      </props.Styles>
      <link rel='icon' type='image/x-icon' href={`${props.contextPath}/resources/img/favicon.ico`} />
    </head>
    <body>
      <div id='fusion-app'>
        {props.children}
      </div>
    </body>
  </html>

OutputType.displayPropTypes = {
  max: PropTypes.number
}

export default OutputType
