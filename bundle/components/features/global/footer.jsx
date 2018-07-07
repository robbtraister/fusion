'use strict'

import React from 'react'
import PropTypes from 'prop-types'

const Footer = (props) => <div>Fusion Footer</div>

Footer.propTypes = {
  customFields: PropTypes.shape({
    logo: PropTypes.string.tag({test: 'some value'})
  })
}

export default Footer
