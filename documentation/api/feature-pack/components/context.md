# Fusion Context

Fusion Context is a React component for accessing the static context properties from the Fusion Consumer.

## Use

The Fusion Context component takes no attributes and uses the render props pattern to call a child function with the static properties.

```js
import React from 'react'

import Context from 'fusion:context'

const MyFeatureComponent = (props) =>
  <Context>
    {(context) => <div>{context.arcSite}</div>}
  </Context>

export default MyFeatureComponent
```

Since the child is expected to be a function, you may also refactor/provide a functional React component.

```js
import React from 'react'

import Context from 'fusion:context'

const ArcSiteComponent = ({ arcSite }) => <div>{arcSite}</div>

const MyFeatureComponent = (props) =>
  <Context>
    {ArcSiteComponent}
  </Context>

export default MyFeatureComponent
```

## Pass-through Props

In order to simplify re-use of functional React components, any attributes provided to the Context component will be passed through to the child function. However, be careful with using this pattern, as in the event of conflict it will override the context properties you are trying to access.

```js
import React from 'react'

import Context from 'fusion:context'

const ArcSiteComponent = ({ arcSite, label }) => <div>{label}: {arcSite}</div>

const MyFeatureComponent = (props) =>
  <Context label='arc-site'>
    {ArcSiteComponent}
  </Context>

export default MyFeatureComponent
```
