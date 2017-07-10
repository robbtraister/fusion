'use strict'

import PropTypes from 'prop-types'

function Consumer (Component) {
  const ContextWrapper = (props, context) => {
    class ConsumerComponent extends Component {
      async (uri) {
        this.fetch(uri, true)
      }

      fetch (uri, asyncOnly) {
        this.state = context.fetch(uri, this, asyncOnly) || {}
      }
    }

    return new ConsumerComponent(props)
  }

  ContextWrapper.contextTypes = {
    fetch: PropTypes.func
  }

  return ContextWrapper
}

export default Consumer
export { Consumer }
