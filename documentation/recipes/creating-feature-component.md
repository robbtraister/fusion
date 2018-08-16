# Creating a Feature Component

After Output Types, Features are probably the most important components in your Feature Pack - after all, that's where the Feature Pack gets its name! The purpose of a Feature is to be a configurable, composable block of markup on your webpage that can display content fetched from your content sources (although it doesn't have to). Features get defined in code in your Feature Pack, then added to a page or template by editors in the PageBuilder Admin.

Since we don't know which Features might exist on a page or template when we define them, it's a good idea to make your Feature code entirely self-sufficient - that is, as much as possible it shouldn't rely on the presence or absence of any other components on the page (this includes Layouts, Chains, and other Features).

## Writing a feature

Let's define a simple Feature whose purpose is to display the headline and list of authors of a story we've fetched from our content source. We'll create a new directory named `headline` in the `/src/components/features/` directory, and a file within that folder called `default.jsx`. The Feature might look like this:

```jsx
/*  /src/components/features/headline/default.jsx  */

import React, { Component } from 'react'

class Headline extends Component {
  render () {
    const authors = ['Alice', 'Bob', 'Charlie']

    return (
      <div>
        <h1>My Headline</h1>
        {authors && authors.length > 0 &&
          <h3>By: {authors.join(', ')}</h3>
        }
      </div>
    )
  }
}

export default Headline
```

This very simple component will work, but doesn't really solve our problem since it doesn't render any dynamic content; just a static, fake headline and list of authors. Let's change that.

## The `@Consumer` decorator

In Fusion, the [`Consumer`](TODO: add link) higher-order function is what provides us dynamic data about the site and page the user requested, the outputType and layouts (if any) that are being used, any `globalContent` on the page, and more. Under the hood, `@Consumer` is a higher-order function that wraps your components with `props` and instance methods that it can use to perform logic and render content. It's not required for all features to be wrapped with `@Consumer` if they don't require the data the Consumer provides - however, most of the time you'll need to since it's rare to have entirely static Feature components.

In this example, we want to access the main headline and list of authors associated with the page the user requested. That data is available as `props.globalContent` provided by the Consumer - to learn more about `globalContent` and its purpose, jump ahead to the [Fetching Content](./fetching-content.md) section. Let's wrap our component with the `@Consumer` decorator and see what changes:

```jsx
/*  /src/components/features/headline/default.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Headline extends Component {
  render () {
    const { globalContent } = this.props
    const authors = globalContent.authors

    return (
      <div>
        <h1>{globalContent.headline}</h1>
        {authors && authors.length > 0 &&
          <h3>By: {authors.join(', ')}</h3>
        }
      </div>
    )
  }
}

export default Headline
```

A few things have changed about our component:
- We're now importing the `Consumer` object from `fusion:consumer` at the top of the file
- On the line above our class definition we've added the `@Consumer` [decorator](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)
- Inside our `render` method we're extracting `globalContent` from `this.props`. We then point our `authors` const at `globalContent.authors` instead of our hardcoded array, and we replace our fake headline with `globalContent.headline`.

If we assume that `globalContent` is providing properties called `headline` and `authors` with the correct data (this depends on your content source), then this component should work!

---

**NOTE**

It's possible to wrap a [functional component](https://reactjs.org/docs/components-and-props.html#functional-and-class-components) in the `@Consumer` decorator and still get props passed as in the class-based syntax - however, only the class-based syntax allows you to use `@Consumer`'s instance methods.

---

## Handling different output types

It's possible to define entirely different versions of a Feature depending on what output type is being rendered. This is useful, for example, in situations where you want to render a desktop web version of a Feature, and then a different mobile web version, and maybe even a version for Google AMP consumption. You can utilize this functionality by naming your feature components after the output types they should correspond to, and then putting them all inside that Feature's specific directory. In the example above, we created a `headline/` directory and added a `default.jsx` file to it, indicating that this version of our Feature should be used with the "default" outputType. If we wanted to create a different version of the feature for an outputType called `amp`, we'd simply add an `amp.jsx` file to our `headline/` directory and write whatever AMP-specific Feature code we wanted in it.

TODO: falling back to different output types when spec is finished

Alternatively, if a Feature should act very similarly across multiple Output Types, but has only a few small changes between each, you can simply render a single Feature component for all Output Types and add logical changes based on the `props.outputType` property proved by the Consumer. For example:

```jsx
  render() {
    const { globalContent, outputType } = this.props

    if (outputType === 'amp') {
      return (
        <a href="/link-to-webpage-that-does-something">Click Me!</a>
      )
    }

    return <a onClick={ this.doSomething }>Click Me!</a>
  }
```

In this example, we render slightly different links if the provided `outputType` is `amp` or not. Since AMP doesn't allow JavaScript, we send the user to a link - in all other cases, some client side JS is invoked.

---

**NOTE**

If you only have a single version of a Feature for all Output Types, you can add your Feature file directly to the `features/` directory rather than creating a new directory. Here, we could name our file `/src/components/features/headline.jsx` instead of having a separate `/src/components/features/headline/` directory.

---

It's up to you whether it makes sense to create an entirely new version of a Feature for a different output type, or if the changes are small enough that they can be contained in 1 Feature definition.

**Next: [Creating a Layout Component](./creating-layout-component.md)**
