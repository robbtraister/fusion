# Fusion API

All endpoints described below will be handled as displayed by the lambda function. However, the lambda functions will be exposed publicly at `/pb/api/v3`, so each endpoint must be prefixed to be accessed.

All requests that begin with `/pb/dist` or `/pb/resources` will be handled as if prefixed with `/pb/api/v3/dist`. All other requests that do not begin with `/pb/api/v3` will be handled as `/pb/api/v3/make/:request_uri`.


## Content

-   `/content/:content-source?key=:key[&query=:query][&_website=:website]`

Fetch a specific piece of content, using the content source and key specified. Optionally filter the content with a provided graphql query.

The `_website` parameter will be appended automatically by the public origin


## Rendering

-   `/render/(page|rendering|template)[/:id[/:child-id]][?outputType=:outputType][&_website=:website]`

Render the specified page/rendering/template/chain/feature by id as HTML. If generating a page/rendering/template, the result will be wrapped in the appropriate output-type (either as specified, or the default) and is suitable as a complete webpage. If generating a chain/feature, the containing page/rendering/template must be specified, and the resultant HTML will be only the chain/feature requested, with no output-type wrapping. A page/rendering/template may be rendered without an output-type wrapping by specifying `outputType=false`.

To render with global content, use a POST request where the body of the request contains a JSON object with top-level `content` property. The body may also contain the id (and will take precedence over the URI).


## Resolver

-   `/resolve/*`

Resolve the trailing URI segment into a piece of global content and an associated page/template.

-   `/make/*`

Resolve the trailing URI segment into a piece of global content and an associated page/template, then render the content into the template and return the resultant HTML.


## Assets

Assets are read significantly more frequently than they are written, so they will be stored in and served statically from S3.

### Resources

-   `/resources/*`

Return static files as found in your bundle's `/resources` directory. See [here](../engine/bundle/resources) for an example.

### Scripts

-   `/dist/engine/react.js`

This is the primary client-side library that is shared and used for all pages/templates. It is specific to a fusion release, and can be cached very aggressively.

-   `/dist/(page|rendering|template)/:id/:outputType.js[?useComponentLib=true]`

This returns the javascript function that is used by the fusion engine to generate a rendering. It is used by the client-side browser to update the template, if necessary, as well as hydrate script functionality in the browser.

Pages and Templates should be referenced by id so that you will always receive the current published version. If you need an unpublished script, you must request it by rendering id.

If a request for a page/template is not found in S3, it will be generated on-demand, returned to the caller, and pushed to S3.

-   `POST /dist/(page|rendering|template)[/:id]`

Page and Template scripts should be re-generated and pushed to S3 on publish; this can be accomplished by sending a POST request, as it will force a new script to be generated and uploaded to S3. These publish requests should not specify an outputType in the request since all output types will be re-generated.

The id may be provided in the URI, but will generally be ignored as the body payload should have an id and will take precedence.

### Styles

-   `/dist/(page|tempate)/:id.:hash.css`
