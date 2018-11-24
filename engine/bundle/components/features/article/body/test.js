'use strict'

import PropTypes from 'prop-types'

const Component = (props) =>
  `
this is a js body
${props.body}
`

Component.propTypes = {
  customFields: PropTypes.shape({})
}

export default Component
