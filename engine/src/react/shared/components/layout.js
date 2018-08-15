'use strict'

const React = require('react')

const Layout = (sections) => {
  if (
    (sections instanceof React.Component) ||
    (sections instanceof Function)
  ) {
    // we tried to construct a component that is already a component
    return sections
  }

  if ((sections instanceof Array)) {
    // do nothing; use as-is
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
          section.element || 'section',
          {
            key: section.id,
            id: section.id,
            className: section.cssClass || section.className
          },
          props.children[i]
        )
      )
    )

  layout.sections = sections
  return layout
}

module.exports = Layout
