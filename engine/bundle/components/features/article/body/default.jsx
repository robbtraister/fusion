'use strict'

import React from 'react'
import PropTypes from 'prop-types'

import Context from 'fusion:context'

const Component = (props) =>
  <div>
    {props.body}
    <Context>
      {({ arcSite }) => <p>{arcSite}</p>}
      {({ deployment }) => <p>{`${deployment}`}</p>}
    </Context>
  </div>

Component.propTypes = {
  customFields: PropTypes.shape({
  })
}

export default Component
