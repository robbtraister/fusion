'use strict'

const React = require('react')

const Layout = (sections) => {
  if ((sections instanceof Array)) {
    // do nothing
  } else if ((sections instanceof Object)) {
    sections = Object.keys(sections).map((id) => ({id, cssClass: sections[id]}))
  } else {
    sections = []
  }

  const layout = (props) =>
    React.createElement(
      React.Fragment,
      {},
      sections.map((section, i) =>
        React.createElement(
          'section',
          {
            key: section.id,
            id: section.id,
            className: section.cssClass
          },
          props.children[i]
        )
      )
    )

  layout.sections = sections
  return layout
}

module.exports = Layout
