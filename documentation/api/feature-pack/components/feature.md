# Feature API

## Implementation

##### Naming

A Feature is expected to be stored and named in one of the following formats:

- `/src/components/features/{featureGroup}/{featureName}.(js|jsx)`

> This will build one version of this component that is rendered for all Output Types, where the `{featureCategory}` portion of the filepath represents a namespace of related Features, and `{featureName}` represents the name of this Feature.

- `/src/components/features/{featureGroup}/{featureName}/{outputTypeName}.(js|jsx)`

> This will build a version of this component that corresponds to the name of the Output Type in the `{outputTypeName}` portion of the filename. The `{featureCategory}` portion of the filepath represents a namespace of related Features, and `{featureName}` represents the name of this Feature. If there is a component named `default.(js|jsx)`, that component will be rendered as a fallback if no file with the name of the relevant Output Type is found.

##### Example

```jsx
/*  /src/components/features/article/headline.jsx  */

import Consumer from 'fusion:consumer'
import PropTypes from 'prop-types';
import React from 'react'

@Consumer
const Headline = (props) => {
  const { headline, byline } props.globalContent
  const { showByline }
  return (
    <h1>{headline}</h1>
    {showByline &&
      <h3>{byline}</h3>
    }
  )
}

Headline.propTypes = {
  customFields: PropTypes.shape({
    showByline: PropTypes.bool.isRequired
  })
}

export default Headline
```

-----

## Props

### `displayProps` (*Object*)

##### Description

`displayProps` is an object whose names and types are defined per-Output-Type by the [`displayPropTypes`](./output-type.md#displayPropTypes) , and whose values are then set in PageBuilder. The `displayProps` object is intended to be used for display-related properties such as column sizes, hide/show logic and more that may be specific to the Output Type this component is rendering in.

##### Example

```jsx
/*  /src/components/features/global/footer/amp.jsx  */

import React from 'react'

export default (props) => {
  const { fullWidth } = props.displayProps

  return (
    <footer className={fullWidth ? 'col-sm-12' : null}>
      <p>&copy; 2018 Acme Corp.</p>
    </footer>
  )
}
```

-----

## Custom Fields

See the [Custom Fields documentation](./custom-fields.md)
