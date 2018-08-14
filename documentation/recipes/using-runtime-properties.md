# Using Runtime Properties 

Since Fusion applications can support multiple websites with the same Feature Pack, it's often necessary for different sites in the application to have different values for certain pieces of data - and for that, we have runtime properties. Runtime properties are site-specific values that may be accessed anywhere in your bundle, and can hold any data type. Good use cases for runtime properties might include Twitter handles, mailto addresses for contact info, or even just the human-readable name of the site itself.

## Global values

Runtime properties have "global" values that will exist until they are overriden by more specific "site" values - this way, if a "site" value does not exist for a given piece of data, it can fall back to the "global" value. Global values should be defined in `/src/properties/index.js` (or `/src/properties/index.json` if you don't need to compute any values). These values will be the defaults and will be included for all sites, unless explicitly overridden.

Let's define a "global" runtime property here for a fake media conglomerate with many holdings, Acme Media Group:
```js
/*  /src/properties/index.js  */

export default {
  contactEmail: 'contact@acmemedia.com',
}
```
In this case, the only "global" value we want is a contact email address; no other value (like Twitter handle or site name) makes sense to set on a global scale, since we'd rather 
show nothing at all than inaccurate data for those fields.

## Site specific values

Site-specific values should be defined in `variables/sites/${site}.js` (or `variables/sites/${site}.json`), where `${site}` is the "slug" of the website the reader is making a request to. The site "slug" will be determined by whatever the value of the `_website` query parameter is on the URI of the page that was requested; you'll probably use some proxy server to redirect requests and append that query param (but that's outside the scope of these docs).

These values will override any global values when the site is loaded. So let's define some for a specific site owned by Acme Media Group, AcmeFeed (a listicle site for millenials).

```js
/*  /src/properties/sites/acmefeed.js  */

export default {
  siteName: "AcmeFeed: You're Here for the Puppies",
  twitter: 'acmefeed',
  contactEmail: 'editor@acmefeed.com'
}
```
Here, `siteName` and `twitter` are properties that only exist for AcmeFeed, and `contactEmail` will override the "global" `contactEmail` property when the `acmefeed` site is being requested.

## Using properties

Now, we're able to use our runtime properties in a component by using the `getProperties` method provided to us by `fusion:properties`. We just pass in the site name that we get from props like so:
```jsx
/*  /src/components/features/my-component.jsx  */

import React, { Component } from 'react'
import Consumer from 'fusion:consumer'
import getProperties from 'fusion:properties'

@Consumer
class MyComponent extends Component {
  render() {
    const siteVars = getProperties(props.arcSite)
  
    return (
      <div>
        {siteVars.twitter && <a href={`https://twitter.com/${siteVars.twitter}`}>Twitter</a>}
        {siteVars.contactEmail && <a href={`mailto:${siteVars.contactEmail}`}>Contact</a>}
      </div>
    )
  }
}

export default MyComponent
```
Now, when a user requests a webpage on AcmeFeed's website that contains this component, they'll see links to AcmeFeed's Twitter handle (`acmefeed`) and their contact email address (`editor@acmefeed.com`). If AcmeFeed hadn't had a specific contact email address, that value would have fallen back to the "global" value `contact@acmemedia.com`.


 **Next: [Using Environment "Secrets"](./using-environment-secrets.md)**
