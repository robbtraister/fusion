# Using Third-Party Libraries

One of the huge benefits of Fusion Feature Packs being written entirely in JavaScript is that developers have access to the vast JavaScript ecosystem and community. At a practical level, that means the ability for Feature Pack developers to use third-party libraries and code available via modern JavaScript package managers in their Feature Packs. 

Fusion currently supports [NPM](https://www.npmjs.com/) as its package management option for developers. We do not support Yarn.

## Root `package.json` vs. `/src/package.json`

As you may recall from the [Examining a Feature Pack guide](./examining-feature-pack.md), we discussed how the "root" Feature Pack directory is considered the domain of the Fusion platform itself, while the `/src` directory is the folder Feature Devs should be concerned with. With that in mind, it's important that when you're installing a module for use in a Fusion Feature Pack, that you do so in the correct directory.

Both the root directory *and* the `/src` directory have `package.json` files; however, they serve different purposes. The root `package.json` file exists solely to provide developers with handy `npm` scripts they can use from their command line - it is *not* where you want to install modules for Feature Pack use. The `/src/package.json` is the manifest file that you want to use when installing modules - this is the file that gets uploaded with your bundle when you deploy your code. This means that when you're installing a module in your Feature Pack, you'll want to `cd` into the `/src` directory first.

**TLDR;** If you find that a module you've installed isn't being found, make sure you included it in the `/src/package.json`, not the "root" `package.json`.

## Installing and using a module

With that in mind, let's install a module from NPM. First, let's go to the `/src` directory as we discussed:

```bash
$ cd ./src
```

> **NOTE**
> 
> If for some reason your `/src` directory does not have a `package.json` by default, you'll need to create one:
>
> ```bash
> $ npm init
> ```
> 
> Follow the prompts (you can leave them all empty to start with) and afterwards a `package.json` file will be created for you.

Now we can install the module we want from NPM. I'd like to use a simple helper method from lodash to help shuffle items in a collection around:

```bash
$ npm install lodash.shuffle
```

Now if we look in our `/src/package.json` file, we should see `lodash.shuffle` listed in the dependencies!

Now we can use this module in our Feature Pack. Remember our `movies.jsx` component? Let's see if we can find a place to use our new `shuffle` helper method:

```jsx
/*  /src/components/features/movies/default.jsx  */

import Consumer from 'fusion:consumer'
import React, { Fragment, Component } from 'react'

// We import our shuffle method here...
import shuffle from 'lodash.shuffle'

@Consumer
class Movies extends Component {
  ...

  fetch () {
    const { fetched } = this.getContent('movie-db', { movieQuery: 'Jurassic', page: this.state.page }, '{ totalResults Search { Title Year Poster } }')

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

export default Movies
```

You can see in the snippet above (the `contructor` and `render` methods have been removed for brevity) that we can import our module by its name, just like we would any other module, and use it right in our component.

Modules can be used in any code in your Feature Pack that gets bundled by Webpack - in components, content sources, schemas, even in `environment.js` and runtime property definitions. 

## Considerations

As a great philosopher once said, ["with great power comes great responsbility"](https://www.youtube.com/watch?v=b23wrRfy7SM). It's important to remember that while you *can* import nearly any code available on NPM into your Feature Pack, that doesn't mean you always *should*.

One consideration when evaluating whether to install a module is its size - you have to remember that Fusion uses isomorphic rendering, so any modules that get included in a component get included both server-side *and* client-side unless you tell Fusion differently. It may be tempting to install a module like `moment.js` for its ease of use, but do you really want to include a [227.5kb module](https://bundlephobia.com/result?p=moment@2.22.2) into your client side code just for a single function invocation? The decision is yours alone - [choose wisely](https://www.youtube.com/watch?v=oF2UrYSDb3k).

Another consideration is simply whether the module you are including is intended for client-side use at all. Many modules on NPM are intended for node, server-side use only, and wouldn't make sense to install into a client-side component.

Finally, security and reliability are always concerns when using third-party code. It's common for third-party libraries to have [security vulnerabilities](https://snyk.io/vuln), or even for the packages [to be removed entirely from NPM](https://github.com/stevemao/left-pad/issues/4). When installing third-party libraries, make sure the code is from a reputable source, check it as thoroughly as possible, and keep your versions up-to-date!

 **Next: [Messaging Between Components](./messaging-between-components.md)**
