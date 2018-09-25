# Event Handling and Interaction

Modern websites and web applications are expected to be engaging, interactive, and fast. For years, web developers have performed a delicate balancing act: trying to create web pages with rich client-side interactivity while avoiding the inherent complexity that comes with building and maintaining them. React has emerged as a powerful tool to simplify building feature-rich web pages, and we chose to build Fusion on top of it for that reason.

As with the rest of this documentation, we expect that you're familiar with basic React, so we won't go into detail on React's syntax or best practices - but it can't hurt to try out an example!

## Responding to events

There's nothing special about handling events in Fusion - you should just [use React as intended](https://reactjs.org/docs/handling-events.html). With that in mind, let's adapt our `MovieDetail` component so we can prevent readers from seeing [spoilers](https://www.geeky-gadgets.com/wp-content/uploads/2009/09/movie-spoilers-t-shirt_1.jpg) if they don't want to.

We'll add a simple feature that toggles the "Plot" to be shown or hidden based on a button click, and default it to hidden so readers don't see the plot on page load. To do that, we'll need a couple of things:

- We need some `state` in our component that keeps track of whether or not the plot is currently shown or hidden. We'll call this boolean `isPlotShown` and default it to `false`.
- We need a method that will toggle the show/hide state of the plot. Let's call it `togglePlot`.
- We need something the user can interact with (probably a button) to invoke the toggle method.
- We need to conditionally show the plot only if `isPlotShown` is true, and change the text of our button to "Show Plot" or "Hide Plot" depending on what state it's in.

We'll tackle these steps one by one.

#### Adding some state

First, we'll add the `isPlotShown` key to the `state` of our component. We'll do that in the class `constructor` method like this:

```jsx
/*  /src/components/features/movies/movie-detail.jsx  */

class MovieDetail extends Component {
  constructor (props) {
    super(props)
    this.state = { isPlotShown: false }
  }
  ...
}

export default MovieDetail
```

This is how you would normally initialize some state in a React component - we need to accept `props` in the `constructor` and pass them to the `super` method as usual, then we can initialize the `state` object with whatever data we want. In this case, the only data we want to set is the `isPlotShown` key to `false`. Step one down!

#### Adding a toggle method

Next, we'll need to create a method called `togglePlot` on our class to toggle the `isPlotShown` method when it's invoked. Here we go:

```jsx
/*  /src/components/features/movies/movie-detail.jsx  */

class MovieDetail extends Component {
  ...
  togglePlot () {
    const { isPlotShown } = this.state
    this.setState({ isPlotShown: !isPlotShown })
  }
  ...
}

export default MovieDetail
```

Our method just destructures the `isPlotShown` key out of the `state` object, then uses [React's `setState` method](https://reactjs.org/docs/react-component.html#setstate) to set the new value to the inverse of the old one. Step two down!

#### Invoking the method

So we've got our togglePlot method ready to go - but it's not being invoked by anything. We'd like it so that when a user clicks the "Show Plot" button, they see the plot shown, and when they click "Hide Plot", the plot goes away.

```jsx
/*  /src/components/features/movies/movie-detail.jsx  */

class MovieDetail extends Component {
  ...
  render () {
    const { isPlotShown } = this.state

    const plotButton = (
      <button onClick={this.togglePlot.bind(this)}>
        {isPlotShown ? 'Hide Plot' : 'Show Plot'}
      </button>
    )

    const Plot = 'Lorem ipsum'
    ...
  }
}

export default MovieDetail
```

In this incomplete snippet from our `render` method, we're creating a `const` named `plotButton` that is the button element users will click on. We're using the `isPlotShown` key to determine if the button should say "Hide Plot" or "Show Plot". Finally, we're setting a `Plot` const to the static value `Lorem ipsum` just for ease of use later. We'll use our `plotButton` in the next step. Only one more to go!

#### Displaying the data

Now all that's left to do is display our `Plot` and `plotButton`:

```jsx
/*  /src/components/features/movies/movie-detail.jsx  */

class MovieDetail extends Component {
  ...
  render () {
    const { isPlotShown } = this.state

    const plotButton = (
      <button onClick={this.togglePlot}>
        {isPlotShown ? 'Hide Plot' : 'Show Plot'}
      </button>
    )

    const Plot = 'Lorem ipsum'

    return (
      <div className='movie-detail col-sm-12 col-md-8'>
        <h1>Jurassic Park</h1>
        <p><strong>Director:</strong> Steven Spielberg</p>
        <p><strong>Actors:</strong> Sam Neill, Laura Dern, Jeff Goldblum, Richard Attenborough</p>

        {/* We're displaying the plot only if `isPlotShown` is truthy, and then rendering the `plotButton` */}
        <p><strong>Plot:</strong> {isPlotShown && Plot} {plotButton}</p>

        <p><strong>Rated:</strong> PG-13</p>
        <p><strong>Writer:</strong> Michael Crichton (novel), Michael Crichton (screenplay), David Koepp (screenplay)</p>
        <p><strong>Year:</strong> 1993</p>
        <img src='https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_SX300.jpg' alt={`Poster for Jurassic Park`} />
      </div>
    )
  }
}

export default MovieDetail
```

All that's changed here is we've replaced the hardcoded "Lorem ipsum" text for our plot with the `Plot` const above, and rendered it conditionally based on the `isPlotShown` value. Then we display the `plotButton` right afterward.

Now if we refresh the page, we should see our "Show Plot" button where the "Lorem ipsum" text was, and be able to toggle the text back and forth by clicking "Show Plot" and "Hide Plot". Great job!

#### The whole thing

Here's what our full component looks like now:

```jsx
/*  /src/components/features/movies/movie-detail.jsx  */

import React, { Component } from 'react'

class MovieDetail extends Component {
  constructor (props) {
    super(props)
    this.state = { isPlotShown: false }
  }

  togglePlot () {
    const { isPlotShown } = this.state
    this.setState({ isPlotShown: !isPlotShown })
  }

  render () {
    const { isPlotShown } = this.state

    const plotButton = (
      <button onClick={this.togglePlot.bind(this)}>
        {isPlotShown ? 'Hide Plot' : 'Show Plot'}
      </button>
    )

    const Plot = 'Lorem ipsum'

    return (
      <div className='movie-detail col-sm-12 col-md-8'>
        <h1>Jurassic Park</h1>
        <p><strong>Director:</strong> Steven Spielberg</p>
        <p><strong>Actors:</strong> Sam Neill, Laura Dern, Jeff Goldblum, Richard Attenborough</p>
        <p><strong>Plot:</strong> {isPlotShown && Plot} {plotButton}</p>
        <p><strong>Rated:</strong> PG-13</p>
        <p><strong>Writer:</strong> Michael Crichton (novel), Michael Crichton (screenplay), David Koepp (screenplay)</p>
        <p><strong>Year:</strong> 1993</p>
        <img src='https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_SX300.jpg' alt={`Poster for Jurassic Park`} />
      </div>
    )
  }
}

export default MovieDetail
```

While this was a simple example of how to add client-side interactivity to a React component in Fusion, it should illustrate that there's nothing different about handling events in standard React vs. Fusion.

 **Next: [Isomorphic vs. Server vs. SPA Rendering](./isomorphic-server-spa-rendering.md)**
