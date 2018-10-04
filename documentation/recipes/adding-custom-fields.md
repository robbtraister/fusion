# Adding Custom Fields to Components

Custom Fields are an especially useful tool when building websites with Fusion and PageBuilder. As their name suggests, Custom Fields allow developers and editors to set arbitrary (i.e. "custom") data (i.e. "fields") on individual instances of Features and Chains in Fusion, which can then be used to change the look, feel or behavior of that particular component.

## What are Custom Fields?

Custom Fields are simply key/value pairs assigned to an individual Feature or Chain. The key names are defined in their respective components, and the values for each component instance are set in the PageBuilder Admin. This allows Feature Pack developers to define and use data relevant to their components, and for PageBuilder editors to decide how individual components should behave.

Common use cases for Custom Fields include setting headings or text that should be customizable for each Feature, styling attributes, and content configurations that allow PageBuilder editors to assign content sources to components.

## Custom Fields as PropTypes

Custom Fields can be added to either Features or Chains in a Feature Pack. Both define Custom Fields in the same way - using React's [PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html) standard to denote the name and type of data the Custom Field is expecting.

Custom Fields can be added to both functional components and class-based components. Here's an example using the `movie-detail` component we defined in the "Creating a Feature Component" guide:

```jsx
/*  /src/components/features/movies/movie-detail.jsx  */

import PropTypes from 'prop-types'
import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class MovieDetail extends Component {
  render () {
    const { Actors, Director, Plot, Poster, Rated, Title, Writer, Year } = this.props.globalContent

    // We can extract our custom field values here, and even set default values if desired...
    const { defaultPosterUrl, showExtendedInfo = false } = this.props.customFields

    // ...then use them in our code as needed.
    // Here, if we don't have a Poster value for this movie, we'll fall back to a default URL provided in the custom field
    const posterOrDefault = Poster || defaultPosterUrl

    return (
      <div className='movie-detail col-sm-12 col-md-8'>
        <h1>{Title}</h1>
        {Director && <p><strong>Director:</strong> {Director}</p>}
        {Actors && <p><strong>Actors:</strong> {Actors}</p>}
        {Plot && <p><strong>Plot:</strong> {Plot}</p>}

        {/* we can use our boolean value `showExtendedInfo` to determine if certain data gets displayed or not */}
        {showExtendedInfo &&
          <Fragment>
            {Rated && <p><strong>Rated:</strong> {Rated}</p>}
            {Writer && <p><strong>Writer:</strong> {Writer}</p>}
            {Year && <p><strong>Year:</strong> {Year}</p>}
          </Fragment>
        }

        {/* here, we use `posterOrDefault` instead of `Poster`, which we set above */}
        {posterOrDefault && Title && <img src={posterOrDefault} alt={`Poster for ${Title}`} />}
      </div>
    )
  }
}

MovieDetail.propTypes = {
  customFields: PropTypes.shape({
    defaultPosterUrl: PropTypes.string.isRequired,
    showExtendedInfo: PropTypes.bool
  })
}

export default MovieDetail
```

As you can see in the code and comments above, we defined a required `defaultPosterUrl` custom field that should hold a URL to a default image if our movie has no "Poster", and an optional `showExtendedInfo` field that is a boolean determining whether to show certain data in this view. These values will now be configurable in the PageBuilder Admin by editors, and we can use them just like any other data in our component to change its behavior!

<!-- TODO: add PB Admin image -->

<!-- TODO: document .tag() functionality -->

Which custom fields are needed in your components is entirely up to your needs as a Feature Pack developer, and those of your PageBuilder editors. You can find the complete list of Custom Field types, along with their options, [in the API documentation here](../api/feature-pack/components/feature.md#custom-fields).

 **Next: [Using a GraphQL Schema](./using-graphql-schema.md)**
