# Fusion Context

In Fusion, features are React components. The custom configuration values that used to come from request attributes are now passed as component properties. But how do you get access to global content? Or fetch custom feature content? These capabilities (I would call them features, but...) are optionally provided to your component via context. This document explains how to use them.

If you want to know more about React context: [https://reactjs.org/docs/context.html](https://reactjs.org/docs/context.html)

## Consumer

The first thing that you need to do is designate your component as a consumer of the data you need. There is a single consumer wrapper that includes all of the globally provided data and can be accessed simply by requiring in `consumer`. It can be used as either a base class or an HOC, as follows:

-   HOC:

```jsx
const React = require('react')
const Consumer = require('consumer')

const MyComponent = (props, context) => <div>{context.globalContent.version}</div>

module.exports = Consumer(MyComponent)
```

-   Base class:

```jsx
const React = require('react')
const Consumer = require('consumer')

class MyComponent extends Consumer {
  render () {
    return <div>{this.context.globalContent.version}</div>
  }
}

module.exports = MyComponent
```

-   Or you can even mix-and-match:

```jsx
const React = require('react')
const Consumer = require('consumer')

class MyComponent extends React.Component {
  render () {
    return <div>{this.context.globalContent.version}</div>
  }
}

module.exports = Consumer(MyComponent)
```

Once you have designated (annotated, but not necessarily using official javascript annotations?) your component as a consumer, it will have access to the following context properties and, if a class, instance methods. Context is accessed using the second input parameter for functional components, or `this.context` for class components. Instance methods are only available for class components and will be accessed directly on `this` (e.g., `this.getContent()`)

### Context Properties

-   globalContent

This is the full data object used as the global content for the rendered page.

-   requestUri

This is the uri that was requested to initiate this rendering

### Instance Methods

-   getContent(sourceName, key, [query])

The `getContent` method will fetch content and optionally return the data if it has already been fetched and is in cache, or a Promise that will resolve to the final data.

The first input parameter, `sourceName`, is simply the name of the content source from which you want to fetch. This content source must be configured in your bundle.

The second input parameter, `key`, will depend on the definition of the content-source, but will be used to uniquely identify the piece of content you want to fetch.

The optional third input parameter, `query`, is a GraphQL query that will be applied to the resultant data to minimize the payload size. This is beneficial for both client-side and server-side fetching, as server-side fetched data must be included in the final HTML rendering to prevent content flashing.

If you are using this for server-rendered content, you should make sure to fetch the content from within the constructor (or componentWillMount, which is also executed during server-side-rendering), as well as set state using the return value.

```jsx
class MyComponent extends Consumer {
  constructor (props, context) {
    super(props, context)

    this.state = this.getContent('content-api', {uri: '/some/data'}, '{type version}')
    if (this.state instanceof Promise) {
      this.state.then(content => this.setState({content}))
    }
  }

  render () {
    return <div>{this.state && this.state.content && this.state.content.type}</div>
  }
}
```

If you are fetching content asynchronously from the client only, you should either make the call from `componentDidMount` (which is not called during server-side-rendering), or wrap it in a `window` check.

Also, if using only asynchronous client-side fetching, there is no need to set `this.state` on initial call as the client-side cache will not be pre-populated with any server-rendered data, and thus the call to getContent will always return a Promise.

```jsx
class MyComponent extends Consumer {
  componentDidMount () {
    this.getContent('content-api', {uri: '/some/data'}, '{type version}')
      .then(content => this.setState({content}))
  }

  render () {
    return <div>{this.state && this.state.content && this.state.content.type}</div>
  }
}
```

or

```jsx
class MyComponent extends Consumer {
  constructor (props, context) {
    super(props, context)

    if (typeof window !== 'undefined') {
      this.getContent('content-api', {uri: '/some/data'}, '{type version}')
        .then(content => this.setState({content}))
    }
  }

  render () {
    return <div>{this.state && this.state.content && this.state.content.type}</div>
  }
}
```

You can fetch multiple pieces of content by making multiple calls to getContent.

```jsx
class MyComponent extends Consumer {
  constructor (props, context) {
    super(props, context)

    const content1 = this.getContent('content-api', {uri: '/some/data'}, '{type version}')
    if (content1 instanceof Promise) {
      content1.then(content1 => this.setState({content1}))
    } else {
      this.state.content1 = content1
    }

    const content2 = this.getContent('content-api', {uri: '/some/other/data'}, '{type version}')
    if (content2 instanceof Promise) {
      content2.then(content2 => this.setState({content2}))
    } else {
      this.state.content2 = content2
    }
  }

  render () {
    return <div>{this.state.content1 && this.state.content1.type} / {this.state.content2 && this.state.content2.type}</div>
  }
}
```

-   setContent(contentFetches)

The `setContent` method is syntactic sugar for the Promise instanceof check when using `this.getContent`. It is used as follows:

```jsx
class MyComponent extends Consumer {
  constructor (props, context) {
    super(props, context)

    this.setContent({
      content1: this.getContent('content-api', {uri: '/some/data'}, '{type version}'),
      content2: this.getContent('content-api', {uri: '/some/other/data'}, '{type version}')
    })
  }

  render () {
    return <div>{this.state.content1 && this.state.content1.type} / {this.state.content2 && this.state.content2.type}</div>
  }
}
```
