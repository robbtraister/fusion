# Consumer API

The `@Consumer` decorator is a higher-order function that can be used to wrap Fusion components and provide them with useful [props](#props) and [instance methods](#instance-methods) via React's [Context API](https://reactjs.org/docs/context.html). The `@Consumer` decorator can wrap any component type *except* for [Output Types](TODO: add link), although it is most typically used for [Features](TODO: add link). It can be used for both class-based components and functional components to provide `props`, however functional components will be unable to use the `Consumer`'s instance methods.


#### Implementation

```jsx

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class MyComponent extends Component {
  ...
}

export default MyComponent

```

## Props

### `arcSite` - *String*

##### Description
The arc site used in this rendering, if multi-site enabled.

##### Example

### `contextPath` - *String*

##### Description
This is the base context path of the application. In the client, you could calculate this using window.location, but this property exists to provide similar server-side access.

##### Example



### `globalContent` - *Object*

##### Description
This is the full data object used as the global content for the rendered page.

##### Example


### `globalContentConfig` - *Object*

##### Description
This is the full config object used to fetch global content for the rendered page.

##### Example



### `layout` - *String*

##### Description
The layout that was used when rendering this page.

##### Example


### `outputType` - *String*

##### Description
The output type that was used when rendering this page.

##### Example


### `requestUri` - *String*

##### Description
This is the uri that was requested to initiate this rendering. In the client, you could access this using window.location, but this property exists to provide similar server-side access.

##### Example



## Instance Methods


### `getContent(contentService, contentConfig, [filter])`

##### Description

##### Parameters
- `contentService`: 
- `contentConfig`: 
- `filter` (*Optional*): 

##### Return
An object with 2 keys: `{ cached, fetched }`. `cached` will be an object containing data already pre-fetched synchronously on the server from the content source. `fetched` will be a Promise that resolves to an object containing newly fetched data from the content source.

##### Example


### setContent

##### Description

##### Parameters

##### Return

##### Example


### fetchContent

##### Description

##### Parameters

##### Return

##### Example


### addEventListener

##### Description

##### Parameters

##### Return

##### Example


### dispatchEvent

##### Description

##### Parameters

##### Return

##### Example


### removeEventListener

##### Description

##### Parameters

##### Return

##### Example
