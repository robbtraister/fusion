# Output Types

Output Types are used to define the HTML wrapping that is applied to server responses (think `head`, `title`, `meta`, `link`, `script` tags, etc). Anything that is part of the server generated HTML, but is not specific to a page/template should be defined in an output type.

When rendering a page, the `outputType` query parameter will be used to determine which output type is used to handle the request; if no parameter is specified, `default` will be used.

You can see some examples [here](../../engine/bundle/components/output-types).

## Children

-   `children`

React uses the convention of a prop named `children` to define content that should be inserted inside your component. We respect this convention for output types. In this case, the `children` prop defines the rendered content of the page. If you want to perform client-side-only rendering, do not include this property in your page ([example](../../engine/bundle/components/output-types/spa.jsx)).

## Properties

Output Types are defined as React components, just like features and chains. However, they are provided a different set of properties (see [here](./components.md) for feature/chain properties).

Each of the following properties are provided as functions that accept further customization (they can also be referenced directly without being called, which will call the function with the default values).

-   `metaTag([{name, default}])`

This prop will insert meta tags into your rendered HTML. If name is provided, it will insert the single meta tag specified. If no name is given, it will insert all meta tags that are enabled in the admin.

The following are equivalent, and will insert multiple meta tags
```js
{props.metaTag}
```
```js
{props.metaTag()}
```

To insert a single meta tag, the following are equivalent.
```js
{props.metaTag('title')}
```
```js
{props.metaTag({name: 'title'})}
```

You may also specify a default value, in case the meta value has not been set
```js
{props.metaTag('title', 'Default Title')}
```
```js
{props.metaTag({name: 'title', default: 'Default Title'})}
```

-   `metaValue([{name}])`

Similar to `metaTag` above, but returns only the value, not a fully rendered HTML meta tag.

-   `libs`

Include the scripts necessary to perform client-side re-render and content refresh. This includes both a shared react script and a specific page/template script.

The following are equivalent
```js
{props.libs}
```
```js
{props.libs()}
```

-   `styles`

Include the generated css for the appropriate page/template and/or output-type. Will insert the computed inlined styles appropriate to the rendering. For a reference link, see `cssLinks` below.

Each of the following are equivalent and will insert all inlined styles for the rendering (both output-type and page/template styles).
```js
{props.styles}
```
```js
{props.styles()}
```

The following will provide access to the computed styles for custom access.
```js
{props.styles(({outputTypeStyles, templateStyles}) => <style amp-custom='true'>{outputTypeStyles}</style>)}
```

-   `cssLinks`

Include the reference links for the appropriate page/template and/or output-type. Will insert a link reference tag. In the case of page/template, the file name will be content hashed to the specific state of the page or template.

Each of the following are equivalent and will insert up to two link tags (output-type link will be included if the output-type has styling; page/template link will always be included, even if empty, in order to support client-side updates).
```js
{props.cssLinks}
```
```js
{props.cssLinks()}
```

The following will provide access to the css reference hrefs for custom access.
```js
{props.cssLinks(({outputTypeHref, templateHref}) => <link rel='stylesheet' type='text/css' href={outputTypeHref} />)}
```

_Note: customizing reference links is not recommended unless absolutely necessary. If inserting a custom link to the page/template styles, please be sure to include `id="template-styles"` since that id is used to update the styles in the case of a newly-published template._

-   `fusion`

Include a special script block that includes fusion-specific values, as well as the server-fetched content cache that is used during client-side refresh to prevent content flashing.

Content refresh may be specifically disabled. This only applies to content that was previously fetched server-side and is available in the content cache; any content that is not in the cache will be fetched from the client, regardless. This feature is generally only useful in the case of prerendered HTML. On-demand HTML is already aware that its content is fresh and will not attempt client-side fetching.

Each of the following are equivalent and should be used in most cases.
```js
{props.fusion}
```
```js
{props.fusion()}
```
```js
{props.fusion(true)}
```
```js
{props.fusion({refreshContent: true})}
```

The following may be used when prerendered HTML does not need to be client-side refreshed.
```js
{props.fusion(false)}
```
```js
{props.fusion({refreshContent: false})}
```