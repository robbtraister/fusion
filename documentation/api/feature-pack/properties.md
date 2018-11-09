# Site Properties

Site Properties are site-specific values that may be accessed anywhere in your bundle. These differ from Environment Variables because 1) they cannot be encrypted/decrypted and 2) they can be site-specific.

## Definition

Site Properties have a set of "global" properties that act as defaults; if a site-specific property of the same name exists, however, the site-specific property overrides the default.

### Global Properties

Global property files are expected to be defined and named in one of the following formats:

- `/properties/index.(js|json)`

##### Example

```jsx
/*  /properties/index.js  */

export default {
  description: 'Acme, Inc.',
  twitter: 'https://twitter.com/acme'
}
```

### Site-Specific Properties

Site-specific property files are expected to be defined and named in one of the following formats:

- `/properties/sites/{siteName}.(js|json)`

> Each site in your multi-site application can have its own file in the `/properties/sites/` directory that specifies properties for that site alone. The `{siteName}` value used to name the file should be the same value that is passed in the `_website` parameter to specify the site being requested.

##### Example

```jsx
/*  /properties/sites/acmefeed.js  */

export default {
  description: 'Acme Feed: A Listicle Site',
  twitter: 'https://twitter.com/acmefeed'
}
```

-----

## Use

Site Properties are accessible in two main ways: by invoking a function with the name of your site as an argument, or as a `prop` called `siteProperties` available on any [`Consumer`](./components/consumer.md) wrapped component.

*Function Invocation*

The "function invocation" syntax expects a single argument: the name of the site you are trying to get Site Properties for. Most of the time, this will be the value of the `Consumer` prop [`arcSite`](./components/consumer.md#arcsite).

The `getProperties` function is imported from the `fusion:properties` namespace.

```jsx
/*  /components/features/header/social-links.jsx  */

import getProperties from 'fusion:properties'
import Consumer from 'fusion:consumer'
import React, { Component } from react

@Consumer
class SocialLinks extends Component {
  render () {
    const twitter = getProperties(this.props.arcSite)

    return (
      <ul>
        ...
        <li><a href={twitter}>Twitter</a></li>
      </ul>
    )
  }
}

export default SocialLinks
```

*`siteProperties` on Consumer components*

If you already have a `Consumer` wrapped component, and simply want the Site Properties for the current `arcSite`, you can simply use the `siteProperties` prop that is part of the `Consumer`.

```jsx
/*  /components/features/header/social-links.jsx  */

import Consumer from 'fusion:consumer'
import React, { Component } from react

@Consumer
class SocialLinks extends Component {
  render () {
    const twitter = this.props.siteProperties

    return (
      <ul>
        ...
        <li><a href={twitter}>Twitter</a></li>
      </ul>
    )
  }
}

export default SocialLinks
```

-----
