# Dynamically Configuring Content

Now we're really cooking with gas! We've written and rendered components, we've set up content sources, we've defined schemas, and we've used both "global" content and fetched new content ourselves. Give yourself a high five!

But believe it or not, we can make our content fetching *even more* dynamic. Currently inside our `MovieList` component, we're hardcoding the name of our content source and the values it is using to query for content. Here's the relevant snippet in our `movie-list` component:

```jsx
/*  /src/components/features/movies/movie-list.jsx  */

  ...
  fetch () {
    const { fetched } = this.getContent('movie-search', { movieQuery: 'Rocky', page: this.state.page }, '{ totalResults Search { Title Year Poster } }')

    fetched.then(response => {
      this.setState({
        movies: [...this.state.movies, ...response.Search],
        page: this.state.page + 1
      })
    })
  }
  ...
```

See how `movie-search` is hardcoded as the name of our content source, and we'll always be searching based on the `movieQuery` parameter set to `Rocky`? What if later on we add a different movie API, or we want to search for movies that *aren't* Rocky? Wouldn't it be great if *all* of those values were configurable in the PageBuilder Admin? Say no more!

## Setting the `contentConfig` Custom Field PropType

One important use of Custom Fields is to allow PageBuilder editors to configure how individual Features fetch content. Because Features are simply React components that rely on content, they are largely agnostic of *where* the content they receive comes from as long as it has the correct keys and values (i.e. data "shape").

With this in mind, Fusion gives you the ability to specify a `contentConfig` propType that is essentially a list of acceptable schemas that this feature could work with. Then in PageBuilder Admin, an editor will be given a list of content sources that match that schema which they can select from.

Let's see how that works:

```jsx
/*  /src/components/features/movies/movie-list.jsx  */

// We have to import the `PropTypes` module so we can use it later
import PropTypes from 'prop-types'
import Consumer from 'fusion:consumer'
import React, { Fragment, Component } from 'react'

@Consumer
class MovieList extends Component {
  ...
}

MovieList.propTypes = {
  customFields: PropTypes.shape({
    // We're using the Fusion-specific PropType `contentConfig` and passing it the name(s) of the GraphQL schemas this component will work with
    movieListConfig: PropTypes.contentConfig('movies')
  })
}

export default MovieList
```

As you can see above, we're defining a set of Custom Fields for our `MovieList` component, then creating a single Custom Field named `movieListConfig`. The interesting part here is the `PropTypes.contentConfig` type that we're using - this is a Fusion-specific PropType that takes in a list of GraphQL schemas that we've defined that should work with this component.

If we refresh our PageBuilder Admin at this point and look in the Custom Fields panel for the `MovieList` component, we should see the following:

<!-- TODO: PB Admin screenshot of MovieList Custom Fields -->

As you can see, now we have a `movieListConfig` dropdown option available in the Admin populated with a list of content sources (in our case there is just 1, `movie-search`). These content sources are the ones that match the GraphQL schema we specified in the `PropTypes.contentConfig()` call (in this case, the schema name is `movies`).

While we only have one content source that matches the `movies` schema right now, in the future we may have multiple content sources that match, and we could then select from any of them as the content source of this component!

## Using the `contentConfig` values from PageBuilder Admin

The `contentConfig` propType should return us an object with 2 properties.

The first is a `contentService` key, whose value is a string representing the name of the content source (in this case, `movie-search`).

The second key is `contentConfigValues`, whose value is an object containing the key/value pairs representing the data we need to query our content source. The key names of this object are the param names defined in our content source, and their values are whatever were entered by the editor in PageBuilder Admin.

Armed with this knowledge, let's see how we can use the `movieListConfig` prop in our `fetch` method to make things more dynamic:

```jsx
/*  /src/components/features/movies/movie-list.jsx  */

  ...
  fetch () {
    // We're destructuring the `contentService` and `contentConfigValues` keys out of the `movieListConfig` prop inside `this.props.customFields`...
    const { movieListConfig = { contentService, contentConfigValues } } = this.props.customFields

    // ...then we can use these values to replace our hardcoded content source name with `contentService` and our query object with `contentConfigValues` (merged with the `page` param)
    const { fetched } = this.getContent(contentService, Object.assign(contentConfigValues, { page: this.state.page }), '{ totalResults Search { Title Year Poster } }')

    fetched.then(response => {
      this.setState({
        movies: [...this.state.movies, ...response.Search],
        page: this.state.page + 1
      })
    })
  }
  ...
```

We've made 2 small, but important, changes.

First, we replaced the first argument to `getContent` (the hardcoded `movie-search` value) with the key `contentService` that we extracted from `this.props.customFields.movieListConfig`.

Then, we replaced the static `{ movieQuery: 'Rocky'}` query object with `Object.assign(contentConfigValues, { page: this.state.page })`, which merges the `contentConfigValues` object with the `page` param that we already had, and sends the whole thing as the new query object to our `resolve` function.

## Wrapping up

It may not seem like a huge change, but what we've done is completely decoupled our component code from the content source it relies on. As long as we have a content source that supplies data matching our `movies` schema, we can let the PageBuilder editors select the source of our content and which data is needed to query it.

For the purposes of our `MovieList` component, the resulting output is the same - but this is a very common use case when working with Arc' Content API, when multiple content sources may return similarly structured data.

 **Next: [Using Runtime Properties](./using-runtime-properties.md)**

