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
The Arc site used in this rendering, if multi-site enabled. This will be determined by the value of the `_website` query parameter appended to the page request.

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
This is the base context path of the application. In the client, you could calculate this using `window.location`, but this property exists to provide similar server-side access.

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

##### Keys
The keys will be the actual data object returned from the content fetch; as such we don't know what they will be beforehand.

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

##### Keys
- `source` (*String*): This is the name of the content source used to fetch the global content of the page or template.
- `key` (*Object*): This an object containing the key/value pairs that were used as arguments to fetch content from the global content source.

##### Example

```jsx
/*  /src/components/features/story-feed.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class StoryFeed extends Component {
  constructor() {
    super(props)
    this.state = { stories: props.globalContent.stories }
    this.fetchStories = this.fetchStories.bind(this)
  }

  fetchStories() {
    const { globalContentConfig } = this.props
    // Use the globalContentConfig to fetch stories from the same content source and with the same arguments as the globalContent fetch
    const { fetched } = this.getContent(globalContentConfig.source, globalContentConfig.key)

    fetched.then(response => {
      this.setState({ stories: [...this.state.stories, ...response.stories] })
    })
  }

  render() {
    const { stories } = this.state
    return (
      <div>
        <ul>
          {stories.map(story => {
            <li><h3>{story.headline}</h3></li>
          })}
        </ul>
        <button onClick={this.fetchStories}>More Stories</button>
      </div>
    )
  }
}

export default StoryFeed
```

-----

### `layout` - *String*

##### Description
The name of the Layout that was used when rendering this page.

##### Example

```jsx
/*  /src/components/features/image.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
export default (props) => {
  // Use the layout prop to determine whether to add a class to our image or not
  const isResponsive = (props.layout === 'responsive-sidebar')

  return <img src={props.imgSrc} className={isResponsive ? 'responsive' : null} />
}
```

-----

### `outputType` - *String*

##### Description
The Output Type that was used when rendering this page.

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
      return (<a href={this.props.linkUrl}>{this.props.text}</a>)
    }

    return <a onClick={this.invokeJsMethod}>{this.props.text}</a>
  }
}

export default Link
```

-----

### `requestUri` - *String*

##### Description
This is the URI that was requested to initiate this rendering. In the client, you could access this using `window.location`, but this property exists to provide similar server-side access.

##### Example

```jsx
/*  /src/components/features/link.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'
import URL from 'url'

@Consumer
class Link extends Component {
  render() {
    const { requestUri, linkUrl, text } = this.props

    // Compare the hostnames of the page that was requested vs. the link to see if the link is to an external domain
    const requestUrlObj = URL.parse(requestUri)
    const linkUrlObj = URL.parse(linkUrl)
    const isDifferentDomain = requestUrlObj.hostname !== linkUrlObj.hostname
    
    // If it's external, open in a new tab
    const targetVal = isDifferentDomain ? '_blank' : null

    return <a target={targetVal} href={linkUrl}>{text}</a>
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
The `getContent` method will fetch content, both on the server and the client, from a content source (identified by the `sourceName` argument) defined in the bundle.

##### Parameters

For syntactic sugar, there are 2 ways to invoke the `getContent` method: with the arguments expanded and passed individually, or as keys of an object.

`getContent(sourceName, key, [filter], [inherit])`
- `sourceName` (*String*): The name of the content source from which you want to fetch. This content source must be configured in your bundle.
- `key` (*Object*): This will depend on the definition of the content source, but will be an object containing key/value pairs used to uniquely identify the piece of content you want to fetch.
- [`filter`] (*String*): A GraphQL query string that will be applied to the resultant data to minimize the payload size. This is beneficial for both client-side and server-side fetching, as server-side fetched data must be included in the final HTML rendering to prevent content flashing.
- [`inherit`] (*Boolean*): A dynamic boolean to determine if `globalContent` should be used to override the config settings provided. If this value is `true`, the `globalContent` will be returned in both the `cached` property and as the resolution of `fetched`.

`getContent(options)`
- `options` (*Object*): An object containing the following properties:
  - `options.sourceName` (*String*): See `sourceName` parameter above.
  - `options.key` (*Object*): See `key` parameter above.
  - [`options.filter`] (*String*): See `filter` parameter above.
  - [`options.inherit`] (*Boolean*): See `inherit` parameter above.

##### Return
An object with 2 keys: `{ cached, fetched }`. `cached` will be an object containing data already pre-fetched synchronously on the server from the content source. `fetched` will be a Promise that resolves to an object containing newly fetched data from the content source.

##### Example

```jsx
/*  /src/components/features/story-feed.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Weather extends Component {
  constructor() {
    super(props)
    this.state = { forecast: null }
  }

  componentDidMount () {
    // Putting this code in `componentDidMount` ensures it only runs client-side, where the location API is available in the browser
    navigator.geolocation.getCurrentPosition((location) => {
      // Assuming we get the user's location successfully, we call getContent to fetch data from the DarkSky API
      const { fetched } = this.getContent({
        // use the `dark-sky` content source, defined in the `/src/content/sources/` directory
        sourceName: 'dark-sky',
        // Pass in the `lat` and `lng` arguments that will be used in the content source to query the API
        key: { lat: location.coords.latitude, lng: location.coords.longitude }, 
        // Pass in a GraphQL filter so we get only the data we need
        filter: '{ daily { summary }}'
      })

      // Use the `fetched` Promise object to get our response and set our forecast info in the component's state
      fetched.then(response => {
        this.setState({ forecast: response.daily.summary })
      })
    })
  }

  render() {
    const { forecast } = this.state
    return forecast ? (<p>{forecast}</p>) : null
  }
}

export default Weather
```

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
