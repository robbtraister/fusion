# Layout API

A Layout is a Fusion component used to wrap Features and/or Chain components as necessary. A Layout wraps all the content on the page not contained in the Output Type, and as such only one can be selected at a time. A Layout for a page or template is selected by an editor in PageBuilder, and its child elements are available to the component as [`props.children`](#children).

Layouts are rendered both on the server and the client (i.e. isomorphically), and can be rendered differently per Output Type. There are several different "syntactic sugar" methods of defining a Layout, depending on how specific your needs are.

## Implementation

##### Naming

A Layout is expected to be stored and named in one of the following formats:

- `/src/components/layouts/{layoutName}.(js|jsx)`

> This will build one version of this component that is rendered for all Output Types, where the `{layoutName}` portion of the filepath represents the name of the Layout.

- `/src/components/layouts/{layoutName}/{outputTypeName}.(js|jsx)`

> This will build a version of this component that corresponds to the name of the Output Type in the filename. The `{layoutName}` portion of the filepath represents the name of the Layout. If there is a component named `default.(js|jsx)`, that component will be rendered as a fallback if no file with the name of the relevant Output Type is found.

##### Example

There are multiple different "syntactic sugar" methods of creating a Layout, each with different levels of specificity. We will enumerate them here, going from least specific to most.

*Raw Array Syntax*

The simplest way to define a Layout is to export an array of strings that represent the names of sections this Layout contains.

```js
export default [
  'top',
  'middle',
  'bottom'
]
```

This will produce the following render:

```jsx
<section id="top">...</section>
<section id="middle">...</section>
<section id="bottom">...</section>
```

*Object Sugar Syntax*

For convenience, the above array can also be represented as an object where the keys represent IDs and the values are CSS classes. You may use the `Layout` HOC imported from `fusion:layout` to wrap your Layout; however, if you don't wrap with the `Layout` HOC, Fusion will do it for you internally anyway.

```js
import Layout from 'fusion:layout'

export default Layout({
  top: 'top-section',
  middle: 'middle-section',
  bottom: 'bottom-section'
})
```

This will produce the following render:

```jsx
<section id="top" class="top-section">...</section>
<section id="middle" class="middle-section">...</section>
<section id="bottom" class="bottom-section">...</section>
```

*Array of Objects Syntax*

The above syntax can be made more specific by exporting an array of objects, with each object specifying some options about a section of the Layout. You may use the `Layout` HOC imported from `fusion:layout` to wrap your Layout; however, if you don't wrap with the `Layout` HOC, Fusion will do it for you internally anyway.

```js
import Layout from 'fusion:layout'

export default Layout([
  {
    id: 'top',
    cssClass: 'top-section'
  },
  {
    id: 'middle',
    cssClass: 'middle-section'
  },
  {
    id: 'bottom',
    cssClass: 'bottom-section',
    element: 'footer'
  }
])
```

This will produce the following render:

```jsx
<section id="top" class="top-section">...</section>
<section id="middle" class="middle-section">...</section>
<footer id="bottom" class="bottom-section">...</footer>
```

*JSX Syntax*

Finally, you can define each Layout as a full JSX component that accepts `props.children` and enumerates them as an array, with each index representing the next enumerated section. When using this syntax, you must manually enumerate the sections this Layout allows using the [`sections()`](#sections) method.

```jsx
/*  /src/components/layouts/article-right-rail.jsx  */

import React from 'react'

const ArticleRightRail = (props) => {
  return (
    <div>
      <header className='col-xs-12 fixed-on-small'>
        <img src='/resources/logo.png' alt='Logo' />
        {props.children[0]}
      </header>
      <section>
        <article className='col-xs-12 col-md-9'>
          {props.children[1]}
        </article>
        <aside className='col-xs-12 col-md-3'>
          {props.children[2]}
        </aside>
      </section>
      <footer className='col-xs-12'>
        {props.children[3]}
        <p>Copyright &copy; 2018</p>
      </footer>
    </div>
  )
}

ArticleRightRail.sections = ['header', 'main', 'sidebar', 'footer']

export default ArticleRightRail
```

-----

## Props

### `children` - *Array*

See the `children` section in the [Output Type API](./output-type.md#children)

-----

## Instance Methods

### `sections()`

##### Description
This method is for providing the names of sections available in this Layout to PageBuilder so they can be configured with content. This is primarily used with the 'JSX Syntax' version of a Layout.

##### Parameters

`sections(sectionNames)`
- `sectionNames` (*Array*): An array of strings representing the names of sections available in this Layout. These will be the names PageBuilder displays to users to allow them to add Features and Chains to.

##### Return
This method returns `undefined`; it is solely used to pass section information to PageBuilder.

##### Example

See the 'JSX Syntax' example above.
