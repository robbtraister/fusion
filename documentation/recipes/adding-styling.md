# Adding Styling to Components

Unfortunately, modern internet users will not abide webpages without frivolities like colors, fonts that aren't Times New Roman, and layouts with more than 1 column. In order to satisfy the evolving demands of readers, you may be forced to add styling to your website with CSS.

There are two different approaches to adding styling to a Fusion site: adding global, static CSS in `<link>` tags, and importing styling directly into components.

## Using static `<link>` tags

By far the easiest way to add styling to your Fusion site is to write static CSS and include it via `<link>` tags in the head of your document, defined in the Output Type. This approach has the advantage of being easy to implement and understand.

Let's say we wanted to add some simple CSS to add common heights and classes to certain classes of images. To do so, let's create a directory called `css/` in our `/resources/` directory and a file called `main.css` within it.

> **NOTE**
>
> The `/resources/` directory is where Fusion expects static assets to be kept - things like images, fonts, CSS, and static JavaScript that can be served directly to the browser without being processed.

Here's some simple CSS for our site:

```css
/*  /resources/css/main.css  */

.image-sm {
  height: 250px;
  width: 250px;
}
```

Now in our `default.jsx` Output Type, we can add a `<link>` tag to our new CSS file.

```jsx
/*  /components/output-types/default.jsx  */

export default (props) => {
  return (
    <html>
      <head>
        <title>{props.metaValue('title') || 'Default Title'}</title>
        {props.metaTag}
        {props.libs}
        {props.cssLinks}
        <link rel='icon' type='image/x-icon' href={`${props.contextPath}/resources/img/favicon.ico`} />
        <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' />

        {/*  Adding a link to our new CSS file  */}
        <link rel='stylesheet' href={`${props.contextPath}/resources/css/main.css`} />
      </head>
      <body>
        <div className='container'>
          <div id='fusion-app'>
            {props.children}
          </div>
        </div>
        {props.fusion}
      </body>
    </html>
  )
}
```

We're using the `props.contextPath` helper above to prefix our path based on the environment we're in (e.g. in the "staging" environment, paths are prefixed with `/pb/`, which `contextPath` handles for us). But other than that, this is a normal `<link>` tag.

All that's left is to actually apply our class to the images we want to resize:

```jsx
/*  /components/features/movies/movie-list.jsx  */

...
class MovieList extends Component {
  ...
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

              {/*  Adding our class on the image below  */}
              <img src={movie.Poster} className='image-sm' />
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

Now the poster images in our `MovieList` component should all be a standard size!

## Importing into components

While including `<link>` tags is a dead simple way to add CSS, it doesn't offer the benefits of modern tooling like CSS preprocessing or module bundling to reduce CSS payload size. An alternative approach is to import CSS or SCSS files directly into our React components. This gives us the following benefits:

- provides all the capabilities of SCSS (variables, importing, mixins, etc.)
- prevents extraneous HTTP requests, since all our CSS will be bundled into a single file
- removes any CSS from components not included on the page, reducing payload size
- allows us to write CSS on a modular, per-component basis for easy re-use

Because Fusion uses [Webpack](https://webpack.js.org/) under-the-hood to bundle module dependencies, it's possible for us to import CSS or SCSS directly into any of our components - features, chains, layouts, and output types - and they will be included on the page automatically.

The more specific the styling is to a certain component, the more targeted we can be about where we import it. In other words, if a style is used across many components on the page, it may be best to import it at the Output Type level; however, styles that are specific to a certain Feature can be imported into that Feature alone, so they won't be included unnecessarily.

Let's re-implement the same image resizing we did above, but this time by importing the CSS into the relevant Feature.

Let's create a new file in `/components/features/movie-list/` called `style.scss`. You'll notice that this is a SCSS file instead of plain CSS, and that we're creating it directly in the relevant component's directory, rather than in the `/resources/` directory.

```scss
/*  /components/features/movie-list/style.scss  */

$image-size: 250px;

.image-sm {
  height: $image-size;
  width: $image-size;
}
```

In this very simple example, we're creating exactly the same styles as we did in the first example - except here you can see we're using SCSS variables to [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) up some of our code.

Now, in our `MovieList` component we can simply import the relevant file and use it as we did before:

```jsx
/*  /components/features/movies/movie-list.jsx  */

// We import the style here...
import './style.scss'

...
class MovieList extends Component {
  ...
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

              {/*  ...and add our class on the image below, just as before  */}
              <img src={movie.Poster} className='image-sm' />
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

Our style should now be applied, just as it was in the first example - except in this case, this CSS **won't** be included on any page that doesn't contain this Feature, reducing our payload size and keeping our code modular.

It's important to note that this only works because of the `{props.cssLinks}` line that we have in our Output Type - this code is responsible for injecting the compiled CSS code from Webpack into each page. Without it, our CSS would not have been added to the page at all!

 **Next: [Using Third Party Libraries](./using-third-party-libraries.md)**
