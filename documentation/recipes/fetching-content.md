# Fetching Content

The whole point of defining a content source, a GraphQL schema, and putting our API credentials in environment variables was so we can use them to retrieve content - and now we're finally ready to do so!

## Using "global" content vs. fetched content

It's important to remember that you only need to fetch content if the content you need has not already been provided to you by `globalContent`, or if you want to retrieve some content client-side. If the content you need in your feature is part of the "global" content of the page, meaning it is semantically identified by the URL the user requested, then you probably don't need to fetch at all.

A quick example: if you have a feature called `authors` whose purpose is to list the authors of the main story on the page, then you will want to use `props.globalContent` - since the information in the `authors` component is semantically tied to the main story. If, however, you are building an unrelated `sports_scores` component that shows the most recent scores from local sports games, that content will almost certainly *not* exist as part of your main story - so you'll need to fetch it separately.

> **NOTE**
>
> Even though you may not need to fetch "feature specific" content in your Feature Pack, you still need to define content sources so resolvers can use them to fetch "global" content. Without content sources you can't get "global" content *or* "feature specific" content.

## Fetching content and setting state

Once we've determined we need to fetch content, we need some more information:
- when do we want to fetch the content (on the server only, the client only, or both?)
- what content source do we want to fetch from?
- what arguments do we need to pass to get the content we want?
- what pieces of data from the returned content do we actually need?

For our purposes, let's say we want to fetch some content from the `movie-search` content source we defined in [Using a GraphQL Schema](./using-graphql-schema.md). Specifically, we want to fetch a list of movies by their titles.

Let's define a simple component called `movie-list` for this purpose:

```jsx
/*  /src/components/features/movies/movie-list.jsx  */

import Consumer from 'fusion:consumer'
import React, { Fragment, Component } from 'react'

@Consumer
class MovieList extends Component {
  constructor (props) {
    super(props)
    this.state = { movies: [] }
  }

  render () {
    const { movies } = this.state
    return (
      <div className='movie-list col-sm-12 col-md-4'>
        <h2>Movies</h2>
        <div className='movie row'>
          {movies && movies.map((movie, idx) =>
            <div className='col-sm-12 border' key={`movie-${idx}`}>
              {/* display movie info here */}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default MovieList
```

Right now, our component doesn't do much - we are initializing an empty `movies` array in our `state` object that the `render` method loops over, but the loop just outputs an empty `<div>` right now. So we need to 1) fetch some movies and add them to our `state`, and 2) output some content inside our movies loop. Let's add a method to the class to do the fetching:

```jsx
  fetch () {
    const { fetched } = this.getContent('movie-search', { movieQuery: 'Rocky' }, '{ totalResults Search { Title Year Poster } }')

    fetched.then(response => {
      this.setState({
        movies: [...this.state.movies, ...response.Search]
      })
    })
  }
```

Here, we're utilizing Fusion's [`getContent` method](../api/feature-pack/components/consumer.md#getContent) to fetch some content and then set some state.

The first argument to `getContent` is the name of the content source (`movie-search` for now).

The second argument is the `key` object that contains the values we actually want to query on - in this case, a `movieQuery` param searching for movies with the word 'Jurassic' in them (this object will be the only argument passed to the `resolve` method in our content source).

Finally, the third argument is a string containing a GraphQL query object, which will filter the results of our JSON down to just the data we need for this component - you'll notice the key names in the filter match those in the [schema we defined a couple steps ago](./using-graphql-schema.md).

> **NOTE**
>
> The GraphQL query only works because we defined a GraphQL schema earlier - if the query doesn't match the shape of the schema we made earlier, `getContent` will just return the entire JSON response, rather than the filtered version.

As noted in the [API docs](../api/feature-pack/components/consumer.md#getContent), `getContent` actually returns an object with 2 keys: a `cached` object and a `fetched` object. For now we only care about the `fetched` object, which is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that we can chain handlers to.

Here, we've added a handler which should accept the GraphQL-filtered response of our content fetch. We then use React's `setState` method and some fancy ES6 spread syntax to replace the existing `movies` state array with a new one including both the existing movies and the new ones from our fetch (contained in `response.Search`).

This method should work great - except we haven't invoked it anywhere! Let's change that in our `constructor` method:

```jsx
  constructor (props) {
    super(props)
    this.state = { movies: [] }
    this.fetch()
  }
```

> **NOTE**
>
> Because we're invoking the `fetch` method in the `constructor`, our fetch will occur on both the server *and* the client side when we're rendering. If we had just wanted to invoke client side, we could have put the `fetch` call inside of `componentDidMount` instead of the `constructor`, since `componentDidMount` only occurs client side.

---

At this point our fetch should be working! The last problem is we aren't displaying any data. Let's fix that too:

```jsx
  render () {
    const { movies } = this.state
    return (
      <div className='movie-list col-sm-12 col-md-4'>
        <h2>Movies</h2>
        <div className='movie row'>
          {movies && movies.map((movie, idx) =>
            <div className='col-sm-12 border' key={`movie-${idx}`}>
              <h4>{movie.Title}</h4>
              <p><strong>Year:</strong> {movie.Year}</p>
              <img src={movie.Poster} />
            </div>
          )}
        </div>
      </div>
    )
  }
```

Because React will re-render automatically whenever there is a change to the `state` or `props` of our component, and we're triggering a state change when we fetch our new movies, we can simply iterate over the `movies` array in our state and output the information we want (`Title`, `Year`, `Poster`) for each movie as if they'd always been there. This should result in a working component that fetches and displays data about movies with the word 'Rocky' in the title! Let's see the entire component together:

```jsx
/*  /src/components/features/movies/movie-list.jsx  */

import Consumer from 'fusion:consumer'
import React, { Fragment, Component } from 'react'

@Consumer
class MovieList extends Component {
  constructor (props) {
    super(props)
    this.state = { movies: [] }
    this.fetch()
  }

  fetch () {
    const { fetched } = this.getContent('movie-search', { movieQuery: 'Rocky' }, '{ totalResults Search { Title Year Poster } }')

    fetched.then(response => {
      this.setState({
        movies: [...this.state.movies, ...response.Search]
      })
    })
  }

  render () {
    const { movies } = this.state
    return (
      <Fragment>
        <h2>Movies</h2>
        <div>
          {movies && movies.map((movie, idx) =>
            <div key={`movie-${idx}`}>
              <h4>{movie.Title}</h4>
              <p><strong>Year:</strong> {movie.Year}</p>
              <img src={movie.Poster} />
            </div>
          )}
        </div>
      </Fragment>
    )
  }
}

export default MovieList
```

## Adding pagination

Unfortunately, this only fetches the *first page* of movies with "Jurassic" in the title from OMDB. But since OMDB's API allows us to send a `page` param, and our content source is already set up to accept such a param, it's easy to add pagination to this feature:

```jsx
/*  /src/components/features/movies/movie-list.jsx  */

import Consumer from 'fusion:consumer'
import React, { Fragment, Component } from 'react'

@Consumer
class MovieList extends Component {
  constructor (props) {
    super(props)
    this.state = { movies: [], page: 1 }
    this.fetch()
  }

  fetch () {
    const { fetched } = this.getContent('movie-search', { movieQuery: 'Rocky', page: this.state.page }, '{ totalResults Search { Title Year Poster } }')

    fetched.then(response => {
      this.setState({
        movies: [...this.state.movies, ...response.Search],
        page: this.state.page + 1
      })
    })
  }

  render () {
    const { movies } = this.state
    return (
      <Fragment>
        <h2>Movies</h2>
        <div>
          {movies && movies.map((movie, idx) =>
            <div key={`movie-${idx}`}>
              <h4>{movie.Title}</h4>
              <p><strong>Year:</strong> {movie.Year}</p>
              <img src={movie.Poster} />
            </div>
          )}
          <button onClick={() => { this.fetch() }}>More</button>
        </div>
      </Fragment>
    )
  }
}

export default MovieList
```

All we had to do to get pagination working was:

- add a `page` property to our state object and initialize it to `1`
- include the `page` property in the `key` object sent to `getContent`; since our `movie-search` content source knows how to handle this param, it should "just work"
- increment the `page` in the component's state whenever we fetch, so next time we'll fetch the following page
- Add a button at the bottom of the component that allows us to call the `fetch` method, which should get the next page of results, display the new results, and increment the page all at once.

And that's how you fetch content in Fusion. Phew!

 **Next: [Dynamically Configuring Content](./dynamically-configuring-content.md)**
