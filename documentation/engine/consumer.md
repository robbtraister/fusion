# Fusion Context

In Fusion, features are React components. The custom configuration values that used to come from request attributes are now passed as component properties. But how do you get access to global content? Or fetch custom feature content? These capabilities (I would call them features, but...) are provided to your component via context. This document explains how to use them.

If you want to know more about React context: [https://reactjs.org/docs/context.html](https://reactjs.org/docs/context.html)

## Consumer

~The first thing that you need to do is designate your component as a consumer of the data you need. There is a single consumer wrapper that includes all of the globally provided data and can be accessed simply by requiring in `consumer`. It should be used as a higher-order component (HOC), as follows~ For simplicity, all features will be designated as Consumers and have the hooks injected automatically.

Features will have access to the following properties and, if a class, instance methods. Instance methods are only available for class components and will be accessed directly on `this` (e.g., `this.getContent()`)

### Properties

-   arcSite

The arc site used in this rendering, if multi-site enabled.

-   contextPath

This is the base context path of the application. In the client, you could calculate this using window.location, but this property exists to provide similar server-side access.

-   globalContent

This is the full data object used as the global content for the rendered page.

-   outputType

The output type that was used when rendering this page.

-   requestUri

This is the uri that was requested to initiate this rendering. In the client, you could access this using window.location, but this property exists to provide similar server-side access.

### Instance Methods

-   getContent(sourceName, key, [query])

The `getContent` method will fetch content and return an object with two properties, `cached` and `fetched`. The first property, `cached`, will contain the synchronous data as already pre-fetched on the server. The second property, `fetched`, will be a Promise object that resolves to freshly re-fetched content.

The first input parameter, `sourceName`, is simply the name of the content source from which you want to fetch. This content source must be configured in your bundle.

The second input parameter, `key`, will depend on the definition of the content-source, but will be an object used to uniquely identify the piece of content you want to fetch.

The optional third input parameter, `query`, is a GraphQL query that will be applied to the resultant data to minimize the payload size. This is beneficial for both client-side and server-side fetching, as server-side fetched data must be included in the final HTML rendering to prevent content flashing.

If you are using this for server-rendered content, you should make sure to fetch the content from within the constructor (or componentWillMount, which is also executed during server-side-rendering), as well as set state using the return value.

```jsx
class MyComponent extends React.Component {
  constructor (props) {
    super(props)

    const {cached, fetched} = this.getContent('content-api', {uri: '/some/data'}, '{type version}')
    this.state = cached || {}
    fetched.then(data => this.setState(data))
  }

  render () {
    return <div>{this.state && this.state.content && this.state.content.type}</div>
  }
}
```

If you are fetching content asynchronously from the client only, you should either make the call from `componentDidMount` (which is not called during server-side-rendering), or wrap it in a `window` check.

Also, if using only asynchronous client-side fetching, there is no need to set `this.state` on initial call as the client-side cache will not be pre-populated with any server-rendered data. In this case, you can just access the fetched result directly.

```jsx
class MyComponent extends React.Component {
  componentDidMount () {
    this.getContent('content-api', {uri: '/some/data'}, '{type version}')
      .fetched
      .then(content => this.setState({content}))
  }

  render () {
    return <div>{this.state && this.state.content && this.state.content.type}</div>
  }
}
```

or

```jsx
class MyComponent extends React.Component {
  constructor (props) {
    super(props)

    if (typeof window !== 'undefined') {
      this.getContent('content-api', {uri: '/some/data'}, '{type version}')
        .fetched
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
class MyComponent extends React.Component {
  constructor (props) {
    super(props)

    const content1 = this.getContent('content-api', {uri: '/some/data'}, '{type version}')
    content1.fetched.then(content1 => this.setState({content1}))

    const content2 = this.getContent('content-api', {uri: '/some/other/data'}, '{type version}')
    content2.fetched.then(content2 => this.setState({content2}))

    this.state = {
      content1: content1.cached
      content2: content2.cached
    }
  }

  render () {
    return <div>{this.state.content1 && this.state.content1.type} / {this.state.content2 && this.state.content2.type}</div>
  }
}
```

-   setContent(contentFetches)

The `setContent` method is syntactic sugar for setting both the `cached` data to the initial state property and calling setState on the resolved `fetched` Promise. It is used as follows:

```jsx
class MyComponent extends React.Component {
  constructor (props) {
    super(props)

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

-   fetchContent(contentFetches)

The `fetchContent` method is second-level syntactic sugar that incorporates both `setContent` and `getContent`. It can be used as follows:

```jsx
class MyComponent extends React.Component {
  constructor (props) {
    super(props)

    this.fetchContent({
      content1: {
        source: 'content-api',
        key: {uri: '/some/data'},
        query: '{type version}'
      },
      content2: {
        source: 'content-api',
        key: {uri: '/some/other/data'},
        query: '{type version}'
      }
    })
  }

  render () {
    return <div>{this.state.content1 && this.state.content1.type} / {this.state.content2 && this.state.content2.type}</div>
  }
}
```
