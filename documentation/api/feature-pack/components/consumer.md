# Consumer API

The `Consumer` is a higher-order function that can be used to ["decorate"](https://www.sitepoint.com/javascript-decorators-what-they-are/) Fusion components and provide them with useful [props](#props) and [instance methods](#instance-methods) via React's [Context API](https://reactjs.org/docs/context.html). The `Consumer` function can wrap any component type *except* for [Output Types](./output-type.md), although it is most typically used for [Features](./feature.md). It can be used for both class-based components and functional components to provide `props`, however functional components will be unable to use the [instance methods](#instance-methods) provided by `Consumer`.


## Implementation

The `Consumer` function is imported from the `fusion:consumer` namespace. It can be invoked as a function or using decorator syntax; both produce the same result.

##### Example

*Decorator Syntax*

```jsx
import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class MyComponent extends Component {
  ...
}

export default MyComponent
```

*Function Syntax*

```jsx
import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

class MyComponent extends Component {
  ...
}

export default Consumer(MyComponent)
```

-----

## Props

### `arcSite` (*String*)

##### Description
The Arc site used in this rendering, if multi-site enabled. This will be determined by the value of the `_website` query parameter appended to the page request.

##### Example

```jsx
/*  /src/components/features/global/footer.jsx  */

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

### `contextPath` (*String*)

##### Description
This is the base context path of the application. In the client, you could calculate this using `window.location`, but this property exists to provide similar server-side access.

##### Example

```jsx
/*  /src/components/features/global/logo.jsx  */

import Consumer from 'fusion:consumer'
import React from 'react'

@Consumer
export default (props) => {
  <img src={`${props.contextPath}/resources/img/logo.png`} />
)
```

-----

### `globalContent` (*Object*)

##### Description
This is the full data object used as the global content for the rendered page.

##### Keys
The keys will be the actual data object returned from the content fetch; as such we don't know what they will be beforehand.

##### Example

```jsx
/*  /src/components/features/article/headline.jsx  */

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

### `globalContentConfig` (*Object*)

##### Description
This is the full config object used to fetch global content for the rendered page.

##### Keys
- `source` (*String*): This is the name of the content source used to fetch the global content of the page or template.
- `key` (*Object*): This an object containing the key/value pairs that were used as arguments to fetch content from the global content source.

##### Example

```jsx
/*  /src/components/features/article/story-feed.jsx  */

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

### `layout` (*String*)

##### Description
The name of the Layout that was used when rendering this page.

##### Example

```jsx
/*  /src/components/features/common/image.jsx  */

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

### `outputType` (*String*)

##### Description
The Output Type that was used when rendering this page.

##### Example

```jsx
/*  /src/components/features/common/link.jsx  */

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

### `requestUri` (*String*)

##### Description
This is the URI that was requested to initiate this rendering. In the client, you could access this using `window.location`, but this property exists to provide similar server-side access.

##### Example

```jsx
/*  /src/components/features/common/link.jsx  */

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
This method adds an event listener to a Fusion component that will respond to events of the specified `eventName` by invoking the specified `eventHandler`. Events are dispatched by invoking [`dispatchEvent`](#dispatchEvent) in other Fusion components. Listeners can be removed by the [`removeEventListener`](#removeEventListener) method.

##### Parameters

`addEventListener(eventName, eventHandler)`
- `eventName` (*String*): The name of the event to subscribe to.
- `eventHandler(payload)` (*Function*): The function that will handle the event when it is triggered. This function receives the event's payload as its only argument.

##### Return
This method returns `undefined`; its effect is to 'subscribe' the event handler to the appropriate event.

##### Example

```jsx
/*  /src/components/features/utils/error-message.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class ErrorMessage extends Component {
  ...
  componentDidMount () {
    this.addEventListener('errorOccurred', (error) => {
      const errorMsg = error && error.message ? error.message : 'Something went wrong'
      this.setState({ message: errorMsg })
    })
  }
  ...
}

export default ErrorMessage
```

-----

### `dispatchEvent()`

##### Description
This method dispatches an event from a Fusion component of the specified `eventName` with an arbitrary `payload` to be received by another component's event handling function (which gets subscribed via the [`addEventListener`](#addEventListener) method).

##### Parameters

`dispatchEvent(eventName, payload)`
- `eventName` (*String*): The name of the event to dispatch, which listeners can subscribe to.
- [`payload`] (*?*): An arbitrary payload attached to the event, for the handler to use in processing.

##### Return
This method returns `undefined`; its effect is to dispatch the event to each subscriber.

##### Example

```jsx
/*  /src/components/features/weather/weather-lookup.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class WeatherLookup extends Component {
  ...
  handleFormInput(value) {
    if (!value || value.length < 5) {
      this.dispatchEvent('errorOccurred', {
        val: value,
        message: 'Zip code must be at least 5 characters long.'
      })
    }
    ...
  }
  ...
}

export default WeatherLookup
```

-----

### `fetchContent()`

##### Description
The `fetchContent` method is second-level syntactic sugar for using both [`getContent`](#getContent) and [`setContent`](#setContent) together. It takes a map whose keys are the names of content to be stored in the component's `state` (using `setContent`), and the values are configuration options used to fetch content from a content source (using `getContent`). `fetchContent` will then fetch the content using the content configuration and set it on the component's `state` using the key names in `contentConfigMap`.

##### Parameters

`fetchContent(contentConfigMap)`
- `contentConfigMap` (*Object*): An object whose keys are the names of content to be stored in the component's `state`, and the values are configuration objects idential to those of the [`getContent`](#getContent) parameters.
  -  `contentConfigMap.{contentKey}` (*Object*): Here, `{contentKey}` represents the name of a property the developer chooses to set on the component's `state` object. Multiple `{contentKey}` objects can exist on the same `contentConfigMap` object.
      - `contentConfigMap.{contentKey}.sourceName` (*String*): See `sourceName` parameter in [`getContent`](#getContent) method.
      - `contentConfigMap.{contentKey}.key` (*Object*): See `key` parameter in [`getContent`](#getContent) method.
      - [`contentConfigMap.{contentKey}.filter`] (*String*): See `filter` parameter in [`getContent`](#getContent) method.
      - [`contentConfigMap.{contentKey}.inherit`] (*Boolean*): See `inherit` parameter in [`getContent`](#getContent) method.


##### Return
This method returns `undefined`; its effect is to set the `state` properties listed in the `contentConfigMap` with the approprite values.


##### Example

```jsx
/* /src/components/features/homepage/topics.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Topics extends React.Component {
  constructor (props) {
    super(props)

    this.fetchContent({
      topics: {
        source: 'content-feed',
        key: { feedType: 'taxonomy.tags.slug', feedParam: '*', limit: 5, offset: 0, order: 'display_date:desc' },
        query: '{ headline }'
      }
    })
  }

  render () {
    return (
      <ul>
        {this.state.topics.map(topic =>
          <li>{topic.headline}</li>
        )}
      </ul>
    )
  }
}

export default Topics
```

-----

### `getContent()`

##### Description
The `getContent` method will fetch content, both on the server and the client, from a content source (identified by the `sourceName` argument) defined in the bundle.

##### Parameters

For syntactic sugar, there are 2 ways to invoke the `getContent` method: with the arguments expanded and passed individually, or as keys of an object.

*Expanded Syntax*

`getContent(sourceName, key, [filter], [inherit])`

- `sourceName` (*String*): The name of the content source from which you want to fetch. This content source must be configured in your bundle.
- `key` (*Object*): This will depend on the definition of the content source, but will be an object containing key/value pairs used to uniquely identify the piece of content you want to fetch.
- [`filter`] (*String*): A GraphQL query string that will be applied to the resultant data to minimize the payload size. This is beneficial for both client-side and server-side fetching, as server-side fetched data must be included in the final HTML rendering to prevent content flashing.
- [`inherit`] (*Boolean*): A dynamic boolean to determine if `globalContent` should be used to override the config settings provided. If this value is `true`, the `globalContent` will be returned in both the `cached` property and as the resolution of `fetched`.

*Object Syntax*

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
/*  /src/components/features/weather/forecast.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class WeatherForecast extends Component {

  constructor() {
    super(props)
    this.state = { forecast: null }
  }

  componentDidMount () {
    navigator.geolocation.getCurrentPosition((location) => {
      // If we get the user's location, call getContent to fetch data from the DarkSky API
      const { fetched } = this.getContent({
        // Specifying the `dark-sky` content source
        sourceName: 'dark-sky',
        // `key` object needs `lat` and `lng` arguments to query the DarkSky API
        key: { lat: location.coords.latitude, lng: location.coords.longitude },
        // GraphQL filter so we get only the data we need
        filter: '{ daily { summary }}'
      })

      // Use the `fetched` Promise to get our response and set the forecast info in the component's state
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

export default WeatherForecast
```

-----

### `removeEventListener()`

##### Description
This method 'unsubscribes' the specified event handling function (`eventHandler`) from the `eventName` specified. The `eventHandler` must be a reference to the exact function instance that was added via [`addEventListener`](#addEventListener), not a copy.

##### Parameters

`removeEventListener(eventName, eventHandler)`
- `eventName` (*String*): The name of the event to unsubscribe the handler from.
- `eventHandler` (*Function*): A reference to the exact instance of the handler function that was previously added.

##### Return
This method returns `undefined`; its effect is to 'unsubscribe' the event handler from the appropriate event.

##### Example

```jsx
/*  /src/components/features/utils/error-message.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class ErrorMessage extends Component {
  handleErrorMsg (error) {
    const errorMsg = error && error.message ? error.message : 'Something went wrong'
      this.setState({ message: errorMsg })
    })
  }

  componentDidMount () {
    this.addEventListener('errorOccurred', this.handleErrorMsg.bind(this))
  }

  componentWillUnmount () {
    this.removeEventListener('errorOccurred', this.handleErrorMsg)
  }
  ...
}

export default ErrorMessage
```

-----

### `setContent()`

##### Description

`setContent` takes a response object from [`getContent`](#getContent) and sets the appropriate data to the component's state object once it is fetched. It takes the `cached` data and sets it to the *initial* `state` of the corresponding key, then subsequently updates the component's `state` (by calling [`setState`](https://reactjs.org/docs/react-component.html#setstate))  with new `fetched` data when its Promise resolves.

##### Parameters

`setContent(contentFetchMap)`
- `contentFetchMap`: (*Object*): An object whose keys are the names of content to be stored in the component's `state`, and the values are returned values from [`getContent`](#getContent).
  -  `contentFetchMap.{contentKey}` (*Object*): Here, `{contentKey}` represents the name of a property the developer chooses to set on the component's `state` object. Multiple `{contentKey}` objects can exist on the same `contentFetchMap` object. The value should be the return value from the [`getContent()`](#getContent) method.
##### Return
This method returns `undefined`; its effect is to set the `state` properties listed in the `contentFetchMap` with the approprite values.

##### Example

```jsx
/* /src/components/features/homepage/topics.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Topics extends React.Component {
  constructor (props) {
    super(props)

    this.setContent({
      topics: this.getContent(
        'content-feed',
        { feedType: 'taxonomy.tags.slug', feedParam: '*', limit: 5, offset: 0, order: 'display_date:desc' },
        '{ headline }'
      )
    })
  }

  render () {
    return (
      <ul>
        {this.state.topics.map(topic =>
          <li>{topic.headline}</li>
        )}
      </ul>
    )
  }
}

export default Topics
```

-----
