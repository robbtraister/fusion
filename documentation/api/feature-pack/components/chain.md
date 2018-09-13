# Chain API

## Implementation

##### Naming

A Chain is expected to be stored and named in one of the following formats:

- `/src/components/chains/*.(js|jsx)`

> This will build one version of this component that is used by all Output Types

- `/src/components/chains/*/{outputTypeName}.(js|jsx)`

> This will build a version of this component that corresponds to the name of the Output Type in the filename. If there is a `default.(js|jsx)` component, that component will be rendered as a fallback if no file with the same name of the relevant Output Type is found.

##### Example

```jsx
/*  /src/components/chains/two-chainz.jsx  */

import React from 'react'

const TwoChainz = (props) => {
  const mid = Math.floor(props.children.length / 2)
  const firstCol = props.children.slice(0, mid)
  const secondCol = props.children.slice(mid)

  return (
    <div>
      <section>{firstCol}</section>
      {secondCol && secondCol.length > 0 &&
        <section>{secondCol}</section>
      }
    </div>
  )
}

export default TwoChainz
```

-----

## Props

### `children` - *Array*

See the `children` section in the [Output Type API](./output-type.md#children)

-----

## Custom Fields

See the Custom Fields section in the [Feature API](./feature.md#custom-fields)
