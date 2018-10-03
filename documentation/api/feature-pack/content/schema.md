# Content Schema API

## Implementation

##### Naming

A Content Source is expected to be stored and named in the following format:

- `/src/content/schemas/{schemaName}.(js|json)`

> This will build a content schema whose name is represented by the `{schemaName}` portion of the filepath.

##### Example

*String Syntax*

The string syntax is easy to use, but may not be suitable for very complex GraphQL schema implementations that use features like [Interfaces](https://graphql.org/learn/schema/#interfaces).

```jsx
/*  /src/content/schemas/ans-content.js  */

module.exports = `

type Description {
  basic: String
}

type Headlines {
  basic: String
}

type Subheadlines {
  basic: String
}

type Query {
  type: String!
  version: String!
  description: Description
  headlines: Headlines
  subheadlines: Subheadlines
}
`
```

*GraphQL Object Syntax*
The GraphQL Object syntax is more verbose than the string syntax, but allows you to be more flexible than the string syntax.

```jsx
/*  /src/content/schemas/ans-content.js  */

```

-----

Because content schemas are essentially just using GraphQL, documentation on how to actually define GraphQL schema is best learned on [GraphQL's docs](https://graphql.org/learn/schema/).
