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

##### Parameters

##### Return

##### Example
