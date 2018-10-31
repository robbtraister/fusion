# Using Third-Party Libraries

One of the huge benefits of Fusion Feature Packs being written entirely in JavaScript is that developers have access to the vast JavaScript ecosystem and community. At a practical level, that means the ability for Feature Pack developers to use third-party libraries and code available via modern JavaScript package managers in their Feature Packs.

Fusion currently supports [NPM](https://www.npmjs.com/) as its package management option for developers. We do not support Yarn.

## Installing and using a module

With that in mind, let's install a module from NPM. I'd like to use a simple helper method from lodash to help shuffle items in a collection around:

```bash
$ npm install lodash.shuffle
```

Now if we look in our `/package.json` file, we should see `lodash.shuffle` listed in the dependencies!

Now we can use this module in our Feature Pack. Remember our `movies.jsx` component? Let's see if we can find a place to use our new `shuffle` helper method:

```jsx
/*  /components/features/movies/movie-list.jsx  */

import Consumer from 'fusion:consumer'
import React, { Fragment, Component } from 'react'

// We import our shuffle method here...
import shuffle from 'lodash.shuffle'

@Consumer
class MovieList extends Component {
  ...

  fetch () {
    const { fetched } = this.getContent('movie-search', { movieQuery: 'Jurassic', page: this.state.page }, '{ totalResults Search { Title Year Poster } }')

    // ...then we can use it here to shuffle new movies fetched from our content source!
    const newMovies = shuffle(response.Search)

    fetched.then(response => {
      this.setState({
        movies: [...this.state.movies, ...newMovies],
        page: this.state.page + 1
      })
    })
  }
  ...
}

export default MovieList
```

You can see in the snippet above (the `contructor` and `render` methods have been removed for brevity) that we can import our module by its name, just like we would any other module, and use it right in our component.

Modules can be used in any code in your Feature Pack that gets bundled by Webpack - in components, content sources, schemas, even in `environment.js` and runtime property definitions.

## Considerations

As a great philosopher once said, ["with great power comes great responsbility"](https://www.youtube.com/watch?v=b23wrRfy7SM). It's important to remember that while you *can* import nearly any code available on NPM into your Feature Pack, that doesn't mean you always *should*.

One consideration when evaluating whether to install a module is its size - you have to remember that Fusion uses isomorphic rendering, so any modules that get included in a component get included both server-side *and* client-side unless you tell Fusion differently. It may be tempting to install a module like `moment.js` for its ease of use, but do you really want to include a [227.5kb module](https://bundlephobia.com/result?p=moment@2.22.2) into your client side code just for a single function invocation? The decision is yours alone - [choose wisely](https://www.youtube.com/watch?v=oF2UrYSDb3k).

Another consideration is simply whether the module you are including is intended for client-side use at all. Many modules on NPM are intended for node, server-side use only, and wouldn't make sense to install into a client-side component.

Finally, security and reliability are always concerns when using third-party code. It's common for third-party libraries to have [security vulnerabilities](https://snyk.io/vuln), or even for the packages [to be removed entirely from NPM](https://github.com/stevemao/left-pad/issues/4). When installing third-party libraries, make sure the code is from a reputable source, check it as thoroughly as possible, and keep your versions up-to-date!

 **Next: [Messaging Between Components](./messaging-between-components.md)**
