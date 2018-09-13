# Consumer API

The `@Consumer` decorator is a higher-order function that can be used to wrap Fusion components and provide them with useful [props](#props) and [instance methods](#instance-methods) via React's [Context API](https://reactjs.org/docs/context.html). The `@Consumer` decorator can wrap any component type *except* for [Output Types](./output-type.md), although it is most typically used for [Features](./feature.md). It can be used for both class-based components and functional components to provide `props`, however functional components will be unable to use the [instance methods](#instance-methods) provided by `Consumer`.


## Implementation

The `Consumer` decorator is imported from the `fusion:consumer` namespace.

##### Example

```jsx
import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class MyComponent extends Component {
  ...
}

export default MyComponent
```

-----

## Props

### `arcSite` - *String*

##### Description
The arc site used in this rendering, if multi-site enabled.

##### Example

```jsx
/*  /src/components/features/footer.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Footer extends Component {
  render() {
    return <p>&copy; 2018 {this.props.arcSite}</p>
  }
}

export default Footer
```

-----

### `contextPath` - *String*

##### Description
This is the base context path of the application. In the client, you could calculate this using window.location, but this property exists to provide similar server-side access.

##### Example

```jsx
/*  /src/components/features/logo.jsx  */

import Consumer from 'fusion:consumer'
import React from 'react'

@Consumer
export default (props) => {
  <img src={`${props.contextPath}/resources/img/logo.png`} />
)
```

-----

### `globalContent` - *Object*

##### Description
This is the full data object used as the global content for the rendered page.

##### Example

```jsx
/*  /src/components/features/headline.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Headline extends Component {
  render() {
    const { headline } = this.props.globalContent
    return headline && (<h1>{headline}</h1>)
  }
}

export default Headline
```

-----

### `globalContentConfig` - *Object*

##### Description
This is the full config object used to fetch global content for the rendered page.

##### Example

-----

### `layout` - *String*

##### Description
The layout that was used when rendering this page.

##### Example

-----

### `outputType` - *String*

##### Description
The output type that was used when rendering this page.

##### Example

```jsx
/*  /src/components/features/link.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Link extends Component {
  ...
  render() {
    const { outputType } = this.props
    if (outputType === 'amp') {
      return (<a href={this.props.someUrl}>{this.props.text}</a>)
    }

    return <a onClick={this.invokeJsMethod}>{this.props.text}</a>
  }
}

export default Link
```

-----

### `requestUri` - *String*

##### Description
This is the uri that was requested to initiate this rendering. In the client, you could access this using window.location, but this property exists to provide similar server-side access.

##### Example

```jsx
/*  /src/components/features/link.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Link extends Component {
  render() {
    const { outputType } = this.props
    if (outputType === 'amp') {
      return (<a href={this.props.someUrl}>{this.props.text}</a>)
    }

    return <a onClick={this.invokeJsMethod}>{this.props.text}</a>
  }
}

export default Link
```

-----


## Instance Methods

### `addEventListener()`

##### Description

##### Parameters

##### Return

##### Example

-----

### `dispatchEvent()`

##### Description

##### Parameters

##### Return

##### Example

-----

### `fetchContent()`

##### Description

##### Parameters

##### Return

##### Example

-----

### `getContent()`

##### Description

##### Parameters

For syntactic sugar, there are 2 ways to invoke the `getContent` method: with the arguments expanded and passed individually, or as keys of an object.

`getContent(sourceName, key, [filter], [inherit])`
- `sourceName`: 
- `key`: 
- `filter` (*Optional*): 
- `inherit` (*Optional*): 

`getContent([options={}])`
- `options.sourceName`:
- `options.key`:
- `options.filter` (*Optional*):
- `options.inherit` (*Optional*): 

##### Return
An object with 2 keys: `{ cached, fetched }`. `cached` will be an object containing data already pre-fetched synchronously on the server from the content source. `fetched` will be a Promise that resolves to an object containing newly fetched data from the content source.

##### Example

-----

### `removeEventListener()`

##### Description

##### Parameters

##### Return

##### Example

-----

### `setContent()`

##### Description

##### Parameters

##### Return

##### Example

-----
