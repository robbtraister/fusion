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

export default `

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
  version: String!
  description: Description
  headlines: Headlines
  subheadlines: Subheadlines
}
`
```

*GraphQL Object Syntax*

The GraphQL Object syntax is more verbose than the string syntax, but allows you to be more flexible.

```js
/*  /src/content/schemas/ans-content.js  */

const DescriptionType = new GraphQLObjectType({
  name: 'Description',
  fields: {
    basic: { type: GraphQLString }
  }
})

const HeadlinesType = new GraphQLObjectType({
  name: 'Headlines',
  fields: {
    basic: { type: GraphQLString }
  }
})

const SubheadlinesType = new GraphQLObjectType({
  name: 'Subheadlines',
  fields: {
    basic: { type: GraphQLString }
  }
})

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'ANS Content',
    fields: {
      version: { type: GraphQLString },
      description: DescriptionType,
      headlines: HeadlinesType,
      subheadlines: SubheadlinesType
    }
  })
})
```

-----

Because content schemas are essentially just GraphQL objects, documentation on how to actually define a GraphQL schema is best learned on [GraphQL's docs](https://graphql.org/learn/schema/). Any features available to GraphQL schemas generally should also be available on your Fusion content schemas. As previously mentioned, complex definitions may require the GraphQL Object syntax.
