# Using a GraphQL Schema

So far, we've been relying on "global" content to render our component entirely server side. But what if we want to fetch content on the client side? For that, we'll need to fetch additional content from the content retrieved in our resolver.

## Defining another content source

Let's say we want to add some functionality to our webpage. In addition to the main part of our page that shows us the details for 1 movie at a time, we also want to have a sidebar that shows a list of relevant movies.

You can see in the [OMDB API docs](http://www.omdbapi.com/#parameters) that it support 2 main endpoints: one for finding individual movies (which we used in our `movie-find.js` source) and one for searching for movies based on a title.  We'll define a new content source called `movie-search.js` to use the search endpoint:

```jsx
/*  /src/content/sources/movie-search.js  */

import { OMDB_API_KEY } from 'fusion:environment'

const resolve = (key) => {
  const requestUri = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${key.movieQuery}`

  return (key.hasOwnProperty('page'))
    ? `${requestUri}&page=${key.page}`
    : requestUri
}

export default {
  resolve,
  schemaName: 'movies',
  params: {
    movieQuery: 'text'
  }
}
```

We won't go over what each piece of the content source does in detail, as that was covered in [Defining a Content Source](./defining-content-source.md). But a short description of this content source is that, given a string that represent the search query (named `movieQuery` here) and an optional `page` parameter (for paginated results), this content source will return a list of movies to us.

## Why GraphQL?

Now we need to define a GraphQL schema for our content source, so that when we fetch content in our components later on we can request exactly the data we need and nothing more.

If you're unfamiliar with [GraphQL](https://graphql.org/), you should spend some time learning about its purpose and how to use it, but in short: GraphQL is a query language that allows clients to fetch and filter specific shapes of data from servers. It has many use cases, but is often used in Single Page Applications that perform many AJAX requests each with different data dependencies.

GraphQL's approach:
- makes it easier to reason about your code and exactly how it depends on the content it fetches
- gives you the ability to query your data flexibly without having to create separate endpoints for each data shape you need, and
- reduces payload size (thereby improving performance) by allowing you to request only the data you need and nothing more

## Defining a schema

In order to use GraphQL to perform a query, first GraphQL has to know what your data looks like - and for that, we need need to define a GraphQL schema. Your GraphQL schema should enumerate any fields (and their allowed types) in the JSON you wish to query against later on.

The process of defining a schema involves looking at the expected JSON you'll receive from your endpoint, then listing and typing the data you care about. For example, the OMDB API "search" endpoint we are using in our `movie-search` content source returns the following JSON:

```json
/*  https://www.omdbapi.com/?apikey=<apiKey>&s=Rocky&page=1  */

{
  "Search": [
    {
      "Title":"Rocky",
      "Year":"1976",
      "imdbID":"tt0075148",
      "Type":"movie",
      "Poster":"https://m.media-amazon.com/images/M/MV5BMTY5MDMzODUyOF5BMl5BanBnXkFtZTcwMTQ3NTMyNA@@._V1_SX300.jpg"
    },
    ...
  ],
  "totalResults":"198",
  "Response":"True"
}
```
We can see that the JSON response has 3 top level fields (`Search`, `totalResults`, and `Response`). `Search` seems to contain the data we care about, namely an array of objects containing info about movies with "Rocky" in the title.

Because in our `movie-search` content source above we specified the `schemaName` as `movies`, we need to create a file called `movies.js` in the `/src/content/schemas/` directory so Fusion can find the correct schema. We can define the following GraphQL schema in that file:
```js
/*  /src/content/schemas/movies.js  */

const schema = `
  type Movie {
    Title: String!
    Year: Int
    imdbID: String
    Poster: String
  }

  type Query {
    totalResults: Int
    Search: [Movie]!
  }
`

export default schema
```
Let's detail what's going on:
- We define a `const` named `schema` and set it to a string literal containing our GraphQL schema (we're using a template string here just so we can use newline characters easily).
- Within this string we use GraphQL syntax to define our root `Query` type at the bottom, which has the `totalResults` and `Search` properties in it - we don't care about the `Response` property in the JSON, so we can leave it out.
- The `totalResults` property is an integer, so we assign it an `Int` type.
- The `Search` field is defined as a List (denoted by the square brackets) of `Movie` objects, and we mark it as a non-nullable field denoted by the `!` at the end.
- In the `Movie` type, we list the `Title`, `Year`, `imdbId` and `Poster` fields, as well as their types and modifiers. We don't care about the `Type` field in the JSON, so we leave it out.

For more details on GraphQL syntax and schemas check out [GraphQL's schema documentation](https://graphql.org/learn/schema/).

Obviously the schema you define is entirely dependent upon the result you're expecting from your content source, so you'll need to craft schemas ([schemata?](https://english.stackexchange.com/questions/77764/plural-form-of-schema)) on a case-by-case basis. However, if you have multiple content sources that produce similar or identical data shapes (e.g. multiple content sources calling Arc's Content API and returning [ANS](TODO: add link) documents), there's no reason you can't reuse the same schema for multiple content sources.

Now that we have our schema defined, we can use it to fetch some content.

**Next: [Fetching Content](./fetching-content.md)**
