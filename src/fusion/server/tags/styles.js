'use strict'

const PropTypes = require('prop-types')
const React = require('react')

module.exports = context => {
  const Styles = ({ inline }) => [
    inline
      ? React.createElement('style')
      : React.createElement('link', {
          id: 'fusion-template-styles',
          rel: 'stylesheet',
          href: context.styleHash ? `/dist/styles/${context.styleHash}.css` : ''
        }),
    React.createElement('styled-components')
  ]

  Styles.propTypes = {
    inline: PropTypes.bool
  }

  return Styles
}
