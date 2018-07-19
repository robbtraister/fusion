# Layouts

Layouts consist of multiple named sections that are used to segment content and styling.

## Definitions

In fusion, layouts can be defined in many ways, each of which requires some way of identifying the individual sections.

### Layout Component

Fusion provides a default Layout function that may be accessed by importing `fusion:layout`. The fusion layout function accepts an array of section identifier objects, which are transformed into `section` DOM elements with `id` and `class` attributes defined by `id` and `cssClass` properties, respectively.

#### Array Configuration

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
    cssClass: 'bottom-section'
  }
])
```

The above would result in the following render:

```jsx
<section id="top" class="top-section">{props.children[0]}</section>
<section id="middle" class="middle-section">{props.children[1]}</section>
<section id="bottom" class="bottom-section">{props.children[2]}</section>
```

#### Object Sugar

For convenience, the above array can also be represented as an object where the keys represent ids and the values are css classes, as follows:

```js
import Layout from 'fusion:layout'

export default Layout({
  top: 'top-section',
  middle: 'middle-section',
  bottom: 'bottom-section'
})
```

#### Array of IDs

If you do not need to specify custom classes, you may pass in a simple array of ids:

```js
import Layout from 'fusion:layout'

export default Layout([
  'top',
  'middle',
  'bottom'
])
```

### Raw Configuration

For further simplification, each of the above configurations may be exported directly without being passed to the `Layout` function. In this case, Fusion will auto-detect that the value is not a proper React component and will wrap it with the Layout function for you.

```js
export default [
  'top',
  'middle',
  'bottom'
]
```

### React Component

If you want to customize the HTML of a layout, you may provide a standard React component (either class or functional). In this case, the component will receive an array as the children prop with the same number of elements as the layout has sections.

You will, however, need to let Fusion know what sections to expect to be rendered by your layout. To do this, your component should set the `.sections` property. The value of this property can be similar to any of the arguments described for the Layout function above.

```jsx
import React from 'react'

const Layout = (props) =>
  <React.Fragment>
    <header>{props.children[0]}</header>
    <div>{props.children[1]}<div>
    <footer>{props.children[2]}</footer>
  </React.Fragment>

Layout.sections = [
  'header',
  'main',
  'footer'
]

export default Layout
```

```jsx
import React from 'react'

class Layout extends React.Component {
  render () {
    return <React.Fragment>
      <header>{props.children[0]}</header>
      <div>{props.children[1]}<div>
      <footer>{props.children[2]}</footer>
    </React.Fragment>
  }
}

Layout.sections = [
  {
    id: 'header'
  },
  {
    id: 'main'
  },
  {
    id: 'footer'
  }
]

export default Layout
```
