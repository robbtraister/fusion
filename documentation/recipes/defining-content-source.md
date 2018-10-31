# Defining a Content Source

At this point, we have 2 of the [3 inputs Fusion needs to function](./intro.md#how-does-it-work) - we've defined some **code** for our components, and we're using PageBuilder Admin to provide **configuration** to our webpages. The last input we need is **content** to fill in our components with live data. To retrieve content, the first thing we need is a content source - a URI to fetch content from, along with some information about what data that URI needs to perform a query.

## Defining a Content Source in JavaScript

A Fusion content source requires at least 2 pieces of information: a URL endpoint to request JSON from, and a list of params we need to craft the URL. A third piece of info is also often useful (but not required): a GraphQL schema that describes the response shape of the endpoint.

Since our website is supposed to be for movie lovers, let's see what a simple content source definition might look like if we were requesting some data from the [OMDB API](https://www.omdbapi.com/). For this content source, we want to be able to find a certain movie's information based on its title.

Let's create a file called `movie-find.js` in the `/content/sources/` directory of our bundle. Because our file is named `movie-find.js`, we will refer to this content source as `movie-find` later in our code (and in PageBuilder Admin).

```jsx
/*    /content/sources/movie-find.js    */

import { OMDB_API_KEY } from 'fusion:environment'

const resolve = (query) => {
  const requestUri = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&plot=full`

  if (query.hasOwnProperty('movieTitle')) return `${requestUri}&t=${query.movieTitle}`

  throw new Error('movie-find content source requires a movieId or movieTitle')
}

export default {
  resolve,
  schemaName: 'movie',
  params: {
    movieId: 'text',
    movieTitle: 'text'
  }
}

```

In the exported object above, we define all 3 pieces of data that we need for our content source:

#### `resolve` property
The `resolve` property is a function whose output is a URL which returns the JSON we want. It accepts a single argument we've named `query` here (but you could call it anything). The `query` object contains the values of the parameters we need to make a request - in this case, we only need the `movieTitle` param. These values are either set in the PageBuilder Admin (for "global" content) and retried by resolvers, or if you're fetching your own content you will provide the values when you make the fetch call.

We're able to perform logic in our function to transform the URL however we want. In this example, if a `movieTitle` property exists in the `query` object that was passed to us, we want to use that param to find our movie. If it doesn't exist (meaning it skipped the `if` block), we will throw an error since we don't have the data we need to make our request.

Because this URL will typically require some sort of authentication to access, we have access to the `fusion:environment` in content sources, which gives us decrypted access to "secret" environment variables. Here, we are interpolating an `OMDB_API_KEY` environment variable into the URL to authenticate our request. We'll discuss more about ["secrets" and environment variables](./using-environment-secrets.md) later.

#### `schemaName` property
`schemaName` is a string that identifies the name of a GraphQL schema. This schema defines the shape of the JSON returned from the URL we produced in the `resolve` function. While this schema is not required, it will be more difficult to query for particular values in the returned JSON without it.

We'll discuss [how to define a GraphQL schema soon](./using-graphql-schema.md).

#### `params` property
The `params` property will contain a list of parameter names and data types that this content source needs to make a request. For example, in this content source we only have 1 param that we can use to make a request: the `movieTitle` param. Given either of these pieces of data (as part of the `query` object in our resolve method), we are able to craft a URL (in our `resolve` function) that gets us the data we want (e.g `https://www.omdbapi.com/?apikey=<apiKey>&t=Jurassic%20Park` will get us the info for the movie Jurassic Park).

`params` can be defined either as an object (as seen above) or as an [array of objects](../api/feature-pack/content/source.md). If defined as an object, each key of the object will be the name of a param, and its value will be the data type of that param. The allowed data types are `text`, `number` and `site`.

We need this list of params enumerated so that we can tell PageBuilder Admin that they exist. Then, editors can set values for those params - for "example" content in Templates and "global" content on Pages.

## Defining a Content Source in JSON

It's also possible to define a content source in JSON rather than JavaScript. This method of defining a content source should only be used if you don't need to perform any logic to craft your content source URL endpoint (other than interpolating variables, which you can still do). This option exists mostly to support legacy PageBuilder content source configurations. More info about this option will be documented in the near future.

## The `transform` property

An optional fourth parameter that can be provided in the content source object is a `transform` function. The purpose of this function is to transform the JSON response received from our endpoint, in case you want to change the shape of the data somehow before applying a schema to it.

For example, let's say we wanted to count the number of words in the movie's plot and append a `numPlotWords` property to the payload for querying later. We could add the following to our exported object:

```jsx
export default {
  resolve,
  schemaName: 'movies',
  params: { movieQuery: 'text' },
  transform: (data) => {
    return Object.assign(
      data,
      { numPlotWords: data.Plot ? data.Plot.split(' ').length : 0 }
    )
  }
}
```
The `transform` function's only input is the data object it receives from the endpoint you defined, and its only expected output is an object that you want to query against later.

## Using `CONTENT_BASE`

Oftentimes, you will have multiple content sources that all share the same base domain. For example, if you are querying Arc's Content API, you may have a domain like `https://username:password@api.client-name.arcpublishing.com` that many of your content sources share. For this reason, Fusion allows you to define a special `CONTENT_BASE` environment variable that, when present, allows your `resolve` function to return a URL "path" rather than a fully qualified URL, and prefixes the `CONTENT_BASE` before those paths.

For example, let's say I have my `CONTENT_BASE` environment variable set to `https://username:password@api.client-name.arcpublishing.com`, and I want to define a content source for "stories" at that domain. In that case, my `resolve` function might look like this:

```jsx
const resolve = function resolve (query) {
  const requestUri = `/content/v3/stories/?canonical_url=${query.canonical_url || query.uri}`

  return (query.hasOwnProperty('published'))
    ? `${requestUri}&published=${query.published}`
    : requestUri
}
```
As you can see, the `requestUri` string that we return in this case is not a fully qualified URL, but instead just a path (denoted by the starting `/` character). In this case, Fusion will see that this string is not a full URL and will prefix this path with the value of the `CONTENT_BASE` variable before making its request - so we don't have to retype the domain in every content source that shares this domain.

Please note, there is nothing preventing you from still returning fully qualified URLs from other content sources - using `CONTENT_BASE` is purely to keep your code DRY.


**Next: [Using Environment Secrets](./using-environment-secrets.md)**
