# Defining a Content Source

A Fusion content source requires 3 pieces of data: a URL to request JSON from, a GraphQL schema of the JSON response from that URL, and a list of params we need to craft the URL.

## Defining a Content Source in JavaScript

Let's see what a simple content source definition might look like if we were requesting some data from the [OMDB API](https://www.omdbapi.com/), which
 lets us search for movies by their titles.

```jsx
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
  params: { movieQuery: 'text' }
}
```
In the exported object above, we define all 3 pieces of data that we need for our content source:

#### `resolve` property
The `resolve` property is a function whose output is a URL which returns the JSON we want. It accepts a `key` argument, which is an object containing information about the specific request that is being made - this data either comes from a configuration option in PB Admin (for "global" content), or if you're fetching your own content you will provide it explicitly at "fetch" time.

We're able to perform logic in our function to transform the URL however we want. In this example, if a `page` property exists in the `key` object that was passed to us, we want to append that page to the URL so we can get paginated results. However, if it doesn't exist, we don't want to append it. 

Because this URL will typically require some sort of authentication to access, we have access to the `fusion:environment` here, which gives us decrypted access to "secret" environment variables. Here, we are interpolating an `OMDB_API_KEY` environment variable into the URL to authenticate our request. We'll discuss more about ["secrets" and environment variables](./using-environment-secrets.md) later.

#### `schemaName` property
`schemaName` is a string that identifies the name of a GraphQL schema. Every content source should have a GraphQL schema. The schema defines the shape of the JSON returned from the URL we produced in the `resolve` function. Without this schema, it will be more difficult to query for particular values in the returned JSON later on.

We'll discuss [how to define a GraphQL schema in the next article](using-graphql-schema.md).

#### `params` property
The `params` property will contain a list of parameter names and data types that this content source needs to make a request. For example, in this content source we have 2 params that we can use to make a request: the `movieQuery` param, and the `page` param. Given both of these pieces of data (as part of the `key` object in our resolve method), we are able to craft a URL that gets us the data we want (e.g `https://www.omdbapi.com/?apikey=12345&s=Jurassic&page=3` will get us the 3rd page of search results for movies in OMDB that have the word "Jurassic" in the title).

We need this list of params enumerated so that we can tell PageBuilder Admin that they exist. Then, editors can set values for those params - for "example" content in Templates and "global" content on Pages. So why is only the `movieQuery` param listed in the `params` object, and not the `page` param? Because only the `movieQuery` param should be exposed to the PageBuilder Admin for editor configuration. In this case, we don't want editors to be able to pick what page the search results start on - so we don't list `page` as a param. We can still use it in our code, it just won't be exposed to the PageBuilder Admin since we didn't list it.

## Defining a Content Source in JSON

It's also possible to define a content source in JSON rather than JavaScript. This method of defining a content source should only be used if you don't need to perform any logic to craft your content source URL endpoint (other than interpolating variables, which you can still do with this method). This option exists mostly to support legacy PageBuilder content source configurations. More info about this option will be documented in the near future.

## Using `CONTENT_BASE`

Oftentimes, you will have multiple content sources that all share the same base domain. For example, if you are querying Arc's Content API, you may have a domain like `https://username:password@api.client-name.arcpublishing.com` that many of your content sources share. For this reason, Fusion allows you to define a special `CONTENT_BASE` environment variable that, when present, allows your `resolve` function to return a URL "path" rather than a fully qualified URL, and prefixes the CONTENT_BASE before those paths.

For example, let's say I have my `CONTENT_BASE` environment variable set to the domain of this client's Content API endpoint, and I want to define a content source for "stories" at that endpoint. In that case, my `resolve` function might look like this:

```jsx
const resolve = function resolve (key) {
  const requestUri = `/content/v3/stories/?canonical_url=${key.canonical_url || key.uri}`

  return (key.hasOwnProperty('published'))
    ? `${requestUri}&published=${key.published}`
    : requestUri
}
```
As you can see, the `requestUri` string that we return in this case is not a fully qualified URL, but instead just a path (denoted by the starting `/` character). In this case, Fusion will see that this string is not a full URL and will prefix this path with the value of the `CONTENT_BASE` variable before making its request - so we don't have to retype the domain in every content source that shares this domain.

Please note, there is nothing preventing you from still returning fully qualified URLs from other content sources - using `CONTENT_BASE` is purely to keep your code DRY.


**Next: [Using a GraphQL Schema](./using-graphql-schema.md)**
