# Fusion Content

Fusion Content is a React component for fetching feature content that can imported from `fusion:content`. This is a simplified component that wraps the Consumer fetchContent API.

## Use

The Fusion Content component accepts the same attributes as the classic PageBuilder content config and uses the render props pattern to call a child function with the resolved content.

```js
import React from 'react'
import PropTypes from 'prop-types'

import Content from 'fusion:content'

const MyFeatureComponent = (props) =>
  <Content {...props.customFields.myContentConfig}>
    {
      (content) => <div>{content && content.basic.headline}</div>
    }
  </Content>

MyFeatureComponent.propTypes = {
  customFields: PropTypes.shape({
    myContentConfig: PropTypes.contentConfig()
  })
}

export default MyFeatureComponent
```

Since the child is expected to be a function, you may also refactor/provide a functional React component.

```js
import React from 'react'
import PropTypes from 'prop-types'

import Content from 'fusion:content'

const Headline = (content) => <div>{content && content.basic.headline}</div>

const MyFeatureComponent = (props) =>
  <Content {...props.customFields.myContentConfig}>
    { Headline }
  </Content>

MyFeatureComponent.propTypes = {
  customFields: PropTypes.shape({
    myContentConfig: PropTypes.contentConfig()
  })
}

export default MyFeatureComponent
```

## Options

-   global

In lieu of a content configuration, you may specify an attribute of `global={true}`. In this case, the global content for the page will be provided.

-   async

If you specify an attribute of `async={true}`, the content will only be fetched/loaded in the client and not on the server.
