# Using a GraphQL Schema

Now we need to define a GraphQL schema for our content source, so that when we fetch content in our components later on we can request exactly the data we need and nothing more.

## Why GraphQL?
If you're unfamiliar with [GraphQL](https://graphql.org/), you should spend some time learning about its purpose and how to use it, but the short story is: GraphQL is a query language that allows clients to fetch and filter specific shapes of data from servers. It has many use cases, but is often used in Single Page Applications that perform many AJAX requests each with different data dependencies.

GraphQL's approach:
- makes it easier to reason about your code and exactly how it depends on the content it fetches
- gives you increased querying flexibility without the overhead of separate endpoints for separate data shapes, and
- improves performance by allowing you to request only the data you need and nothing more

While GraphQL is often used on data retrieved from a database, there's no reason we can't use it on the JSON documents we'll be fetching from content sources - so that's exactly what we'll do.

## Defining a schema

In order to use GraphQL to perform a query, first GraphQL has to know what your data looks like - and for that, we need need to define a GraphQL schema. Your GraphQL schema should enumerate any fields (and their allowed types) in the JSON you wish to query against later on.

The process of defining a schema involves looking at the expected JSON you'll receive from your endpoint, then listing and categorizing the data you care about. For example, the OMDB API "search" endpoint we are using in our `movie-db` content source returns the following JSON:

```json
/*  https://www.omdbapi.com/?apikey=<apiKey>&s=Jurassic&page=1  */

{
  "Search": [
    {
      "Title":"Jurassic Park",
      "Year":"1993",
      "imdbID":"tt0107290",
      "Type":"movie",
      "Poster":"https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_SX300.jpg"
    },
    ...
  ],
  "totalResults":"122",
  "Response":"True"
}
```
We can see that the JSON response has 3 top level fields (`Search`, `totalResults`, and `Response`). `Search` seems to contain the data we care about, namely an array of objects containing info about movies with "Jurassic" in the title.

Because in our `movie-db` content source we specified the `schemaName` as `movies`, we need to create a file called `movies.js` in the `/src/content/schemas/` directory so Fusion can find the correct schema. We can define the following GraphQL schema in that file:
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

Obviously the schema you define is entirely dependent upon the result you're expecting from your content source, so you'll need to craft them on a case-by-case basis. However, if you have multiple content sources that produce similar or identical data shapes (e.g. multiple content sources calling Arc's content API and returning [ANS](TODO: add link) documents), there's no reason you can't reuse the same schema for multiple content sources.

Now that we have our schema defined, we can use it to fetch and query data!

**Next: [Fetching Content](./fetching-content.md)**
