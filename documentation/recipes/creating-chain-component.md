# Creating a Chain Component

The final type of component we'll deal with is Chains. While Chains aren't strictly necessary to building your Feature Pack, they can be a useful way to organize Features while providing structure and style.

## What are Chains?

Chain components are meant to be simple wrapper elements surrounding a single group of Features. Like every other component, they are defined as React components in JSX. They are most commonly used for things like sidebars, or on Feature-rich standalone pages (like a homepage) with multiple sections of content. Chains are similar to Layouts in that they contain multiple components within them, but are different in a few important ways:

- Layouts have multiple named groups, or "sections" of Features - Chains only have a single group of Features, and thus aren't named
- Layouts can contain both Features and Chains - Chains can only contain Features (not other nested Chains)
- Only one Layout can be applied per page/template, whereas multiple Chains can exist on one page/template
- Chains, like Features, can have custom fields defined on them. We'll talk [more about custom fields](./adding-custom-fields.md) later

## Creating a Chain

Let's say we want to create a simple "sidebar" chain for our Feature Pack. In the `/src/components/chains/` directory we would create a file called `sidebar.jsx` that looks like this:

```jsx
/*  /src/components/chains/sidebar.jsx`  */

import PropTypes from 'prop-types'
import React from 'react'

const Sidebar = (props) => {
  const { hasBorder, heading } = props.customFields

  let classNames = 'col-xs-12 col-md-4'
  classNames = hasBorder ? `${classNames} border-left` : classNames

  return (
    <section className={classNames}>
      {heading &&
        <h3>{heading}</h3>
      }
      <div>
        {props.children}
      </div>
    </section>
  )
}

Sidebar.propTypes = {
  customFields: PropTypes.shape({
    heading: PropTypes.string,
    hasBorder: PropTypes.bool
  })
}

export default Sidebar
```

As usual, let's examine what's going on:

- We're defining a functional component and assigning it to `const Sidebar`
- We use the `hasBorder` custom field (that we define at the bottom of the file) to determine whether or not to add `border-left` to the list of classNames for our `<section>` container
- We return the `<section>` container with a custom `heading` (if one exists), and a div with `props.children` inside of it, which represents the Features that will be added to this Chain in the Admin

There's nothing particularly remarkable about this Chain - we could do a lot more with it, like split the list of `children` into two list and display them in separate elements, but this will serve our purposes for now. The most important thing to remember about Chains is that `props.children` is the property you need to actually render the Features that should be contained in the Chain.

We haven't talked much about [Custom Fields](./adding-custom-fields.md) yet, but as you can see here they are simply values passed to the component that were defined for this Chain in the Admin. So an editor can decide in PageBuilder whether this specific instance of the Sidebar chain should have a heading (and what it should be), as well as whether or not our Sidebar should have a border.

If we go into PageBuilder Admin and refresh our page editor, we should see the "Sidebar" chain show up in the Layout panel now. We can add this Chain to the page (either inside a Layout or on its own), and then drop whatever Features we want into it!

**Next: [Isomorphic vs. Server vs. SPA Rendering](./isomorphic-server-spa-rendering.md)**
