# Using the `Consumer` Higher-Order Function

Back in our ["Creating a Feature Component" guide](./creating-feature-component.md), we created our first Feature and added it to the page - the only problem was, the content inside our component was hardcoded so it would always show the details for a single movie, Jurassic Park. Obviously the point of the component is to dynamically show movie details for *any* movie, based on the user's request. This guide will walk through how to fix our components to use dynamic data provided by Fusion instead of static data.

## Setting up a resolver

<!-- TODO: add section for how to configure a resolver -->

Now that our resolver is fetching "global" content for us, let's see how we can use it in our component.

## What is the `Consumer` function?

In Fusion, the [`Consumer`](../api/feature-pack/components/consumer.md) higher-order function is what provides us dynamic data about the site and page the user requested, the outputType and layouts (if any) that are being used, any "global" content on the page, and more. Under the hood, `Consumer` is a higher-order function that wraps your components with `props` and instance methods that it can use to perform logic and render content.

It's not required for all features to be wrapped with `Consumer` if they don't require the data the Consumer provides - however, most of the time you'll need to since it's rare to have entirely static Feature components.

## Adapting our Feature

Let's jump back to our `movie-detail.jsx` file we created in the ["Creating a Feature Component" guide](./creating-feature-component.md).

In this example, we want to access the title, director, list of actors, and more info associated with the movie the user requested. Now that we've fetched that content in our resolver, it should be available as `props.globalContent` provided by the Consumer. Let's wrap our component with the `Consumer` decorator and see what changes:

```jsx
/*  /src/components/features/movies/movie-detail.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class MovieDetail extends Component {
  render () {
    const { Actors, Director, Plot, Poster, Rated, Title, Writer, Year } = this.props.globalContent

    return (
      <div className='movie-detail col-sm-12 col-md-8'>
        <h1>{Title}</h1>
        {Director && <p><strong>Director:</strong> {Director}</p>}
        {Actors && <p><strong>Actors:</strong> {Actors}</p>}
        {Plot && <p><strong>Plot:</strong> {Plot}</p>}
        {Rated && <p><strong>Rated:</strong> {Rated}</p>}
        {Writer && <p><strong>Writer:</strong> {Writer}</p>}
        {Year && <p><strong>Year:</strong> {Year}</p>}
        {Poster && Title && <img src={Poster} alt={`Poster for ${Title}`} />}
      </div>
    )
  }
}

export default MovieDetail
```

A few things have changed about our component:
- We're now importing the `Consumer` object from `fusion:consumer` at the top of the file
- On the line above our class definition we've added the `Consumer` [decorator](https://www.sitepoint.com/javascript-decorators-what-they-are/)
- Inside our `render` method we're extracting the pieces of data we need from `this.props.globalContent` as `const`s. We can then check whether each piece of data exists, and if so render the appropriate piece of markup.

Now we have our component *and* content source defined, and our resolver fetching content on page load - the last part is to add the Feature to a template and see it in action.

<!-- TODO: add image of PB Admin with Feature -->

And just like that, our component is rendering content dynamically! Go ahead and publish the page and try requesting the URL defined in our resolver with different movie names to see it fetch different content.

> **NOTE**
>
> It's possible to wrap a [functional component](https://reactjs.org/docs/components-and-props.html#functional-and-class-components) in the `Consumer` higher-order function and still get props passed as in the class-based syntax - however, only the class-based syntax allows you to use `Consumer`'s instance methods.

**Next: [Adding Custom Fields to a Components](./adding-custom-fields.md)**
