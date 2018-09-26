# Chain API

Chains are Fusion components that serve as wrapping elements around a group of Features. Features are grouped into a Chain by editors in PageBuilder, and are available to the component as [`props.children`](#children). Chains are rendered both on the server and the client (i.e. isomorphically). Chains also support [custom fields](#custom-fields), and can be rendered differently per Output Type.

## Implementation

##### Naming

A Chain is expected to be stored and named in one of the following formats:

- `/src/components/chains/{chainName}.(js|jsx)`

> This will build one version of this component that is rendered for all Output Types, where the `{chainName}` portion of the filepath represents the name of the Chain.

- `/src/components/chains/{chainName}/{outputTypeName}.(js|jsx)`

> This will build a version of this component that corresponds to the name of the Output Type in the filename. The `{chainName}` portion of the filepath represents the name of the Chain. If there is a component named `default.(js|jsx)`, that component will be rendered as a fallback if no file with the name of the relevant Output Type is found.

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

See the [Custom Fields documentation](./custom-fields.md)
