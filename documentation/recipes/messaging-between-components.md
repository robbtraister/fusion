# Messaging Between Components 

In any software application of sufficient size and complexity, you'll have to deal with [state management](https://en.wikipedia.org/wiki/State_(computer_science)#Program_state) - the `get`ting and `set`ting of common data between disparate components. Fusion applications are no different - but they do come with an interesting set of challenges.

## The problem with state
In a typical web application using React, sharing state between components would be solved by either [lifting state up](https://reactjs.org/docs/lifting-state-up.html) to a common ancestor, or in more complicated scenarios by some sort of state management library like [Redux](https://redux.js.org/), [Mobx](https://mobx.js.org/) or others.

But Fusion applications are *not* typical web applications. The chief difference (and difficulty) in building Fusion apps vs. typical web apps is that **Fusion does not know which components will be on the page at build time**. Because PageBuilder editors are the ones who control which components go on which pages/templates, Feature Pack developers can't be sure which components will coexist when they are writing those components. As a result, state management between components becomes difficult, since we can't reliably depend on any other components to exist on the page!

Because of this, it's considered a Fusion "best practice" to try and write your components in such a way that they are totally self-sufficient and don't depend on the existence or non-existence of any other components on your webpage.

## How to message
However, because we live in a flawed world, sometimes it will become necessary for two components to share small amounts of information between one another. Fusion offers a dead-simple messaging mechanism for one component on the page to notify another (or several others) that a change has occurred.

Let's say we have an urgent need for our movie summary application: users are telling us that when they're reading the plot of a movie, it's distracting to see a list of so many other great movies in the sidebar. So we want to hide the list of movies when the plot of a movie is shown, and display it only when the plot is hidden. The only problem: the `MovieList` lives in a different component than the `MovieDetail`, which is where we toggle the plot to be hidden or shown! Does this sound like a use case contrived to prove a point? You betcha!

The `@Consumer` decorator offers two simple utility methods to help us send and receive messages between components: `dispatchEvent` and `addEventListener`. These methods mimic the methods of the same name that are included on browser DOM nodes; the difference is that these methods are invoked on React components wrapped by the `@Consumer` decorator, not DOM nodes.

The first thing we'll want to do is to dispatch an event from our `MovieDetail` component whenever the plot of our movie is hidden or shown. That's easy enough, we'll just add a couple lines to the `togglePlot` method in our component:

```jsx
/*  /src/components/features/movie-detail/default.jsx  */

@Consumer
class MovieDetail extends Component {
  ...
  togglePlot () {
    const { isPlotShown } = this.state
    // Create a common const `newPlotShown` for the next 2 lines to use
    const newPlotShown = !isPlotShown
    this.setState({ isPlotShown: newPlotShown })
    // Dispatch an event called `moviePlotToggled` whose value is the new state of the plot's visibility
    this.dispatchEvent('moviePlotToggled', newPlotShown)
  }
  ...
}

export default MovieDetail
```

As you can see, we can use the `dispatchEvent` method just like we would on a DOM node to notify any subscribers to the `moviePlotToggled` event what state the movie plot's visibility is in.

Now, we have to listen for that change in our `MovieList` component:

```jsx
/*  /src/components/features/movie-list/default.jsx  */

@Consumer
class MovieList extends Component {
  constructor (props) {
    super(props)
    // Adding the `showList: true` property
    this.state = { movies: [], page: 1, showList: true }
    this.fetch({ page: this.state.page })
  }
  
  // Adding our eventListener inside `componentDidMount` ensures it only happens client-side
  componentDidMount () {
    // Define an event handler that sets the `showList` property to the opposite of the `plotShown` value we receive
    const msgHandler = (plotShown) => {
      this.setState({ showList: !plotShown })
    }
    // Trigger the event handler when the `moviePlotToggled` event is triggered
    this.addEventListener('moviePlotToggled', msgHandler)
  }

  render () {
    const { movies, showList } = this.state
    // Use the `showList` state to determine whether to show the movie list or not
    return showList ? (
      <Fragment>
        ...
      </Fragment>
    ) : null
  }
}

export default MovieList
```

Let's walk through it:
- In order to determine whether or not we should show the `MovieList` or not, we add a `showList` property to our component state that will track whether it should be displayed.
- Inside a `componentDidMount` lifecycle hook, we invoke our `addEventListener` method and pass it the name of the event we're listening for, and a handler for when the event is triggered.
- The handler method receives an argument representing the event payload, which in this case is a boolean of whether or not the plot is shown. If the plot is shown we want to hide the movie list, and vice versa.
- In our render method, we use the `showList` property that we toggled in our event handler to determine whether or not to display the movie list.

The effect of this code should be that when the `moviePlotToggled` event is dispatched in the `MovieDetail` component, our `MovieList` component will listen to that change and toggle its display to be the opposite of whatever the movie plot's state is! Our users can now read the plots of their movies without distraction.

There's no reason we couldn't have several other components listening to this same event if we needed to; this makes the simple messaging API provided by Fusion very flexible.

## Removing listeners

In addition to dispatching events and listening to them, Fusion offers a way to remove listeners as needed. This is not only a good way to prevent multiple triggers of an event handler (if desired); it's also good practice to remove listeners from the page once they (or their parent components) aren't needed anymore, to prevent phantom listeners from [causing memory leaks](http://crockford.com/javascript/memory/leak.html).

Let's say in this instance we only want to toggle the MovieList component one time and never again; we can simply add a `removeEventListener` method invocation inside our event handler.

```jsx
/*  /src/components/features/movie-list/default.jsx  */

@Consumer
class MovieList extends Component {
  ...
  componentDidMount () {
    const msgHandler = (plotShown) => {
      this.setState({ showList: !plotShown })
      // Remove the `msgHandler` event handler function (which is the parent function of this block) as a subscriber from the 'moviePlotToggled' event
      this.removeEventListener('moviePlotToggled', msgHandler)
    }

    this.addEventListener('moviePlotToggled', msgHandler)
  }
  ...
}

export default MovieList
```

In the simple example above, we remove the `msgHandler` event handler inside of itself. This will have the effect of the handler being removed after it is invoked the very first time, meaning in our case that the first time a user clicks "Show Plot" the `MovieList` will go away and not come back until the page is refreshed. It's important that the 2nd argument to `removeEventListener` is a reference to the *exact same* function instance that was passed to the `addEventListener` method.

A more common use of `removeEventListener` might be to remove any listeners from the component inside a `componentWillUnmount` lifecycle method. This should work fine, as long as the event handling functions are made instance methods of the component so they can be referenced in both the `addEventListener` and `removeEventListener` calls.


 **Next: [Helpful Commands](./helpful-commands.md)**
