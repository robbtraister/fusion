'use strict'

import PropTypes from 'prop-types'

function Consumer (Component) {
  class ContextWrapper extends Component {
    constructor (props, context) {
      super(props, context)

      this.fetch = (uri, asyncOnly) => {
        this.state = context.fetch(uri, this, asyncOnly) || {}
      }
      this.async = (uri) => this.fetch(uri, true)
    }
  }

  ContextWrapper.contextTypes = {
    fetch: PropTypes.func
  }

  return ContextWrapper
}

export default Consumer
export { Consumer }
