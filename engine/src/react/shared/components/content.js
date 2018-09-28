'use strict'

const React = require('react')

const Consumer = require('./consumer')

const Content = (contentProps) =>
  React.createElement(
    Consumer(
      class extends React.Component {
        constructor (consumerProps) {
          super(consumerProps)

          if (contentProps.global === true) {
            this.state = {
              content: consumerProps.globalContent
            }
          } else if (contentProps.async !== true || typeof window !== 'undefined') {
            this.fetchContent({
              content: contentProps
            })
          }
        }

        render () {
          return contentProps.children(this.state.content)
        }
      }
    )
  )

module.exports = Content
