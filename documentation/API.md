# Fusion API

All endpoints described below will be handled as displayed by the lambda function. However, the lambda functions will be exposed publicly at `/pb/api/v3`, so each endpoint must be prefixed to be accessed.

All requests that do not begin with `/pb/api/v3` will be handled as `/pb/api/v3/render/:request_uri`.


## Content

-   `/content/:content-source?key=:key[&query=:query]`

Fetch a specific piece of content, using the content source and key specified. Optionally filter the content with a provided graphql query


## Rendering

-   `/render/(page|rendering|template)/:id[/:child-id]`

Render the specified page/rendering/template/chain/feature by id as HTML. If generating a page/rendering/template, the result will be wrapped in the appropriate output-type and is suitable as a complete webpage. If generating a chain/feature, the containing page/rendering/template must be specified, and the resultant HTML will be only the chain/feature requested, with no other wrapping.

To render with global content, use a POST request with the global content supplied as the body of the request.

-   `/render?uri=:uri`

Use the resolver (described below) to fetch the associated page/template and global content. Then pass this data to the rendering endpoint (described above) to generate fully-hydrated HTML.


## Resolver

-   `/resolve/*`
-   `/resolve?uri=:uri`

Resolve the provided URI (either the trailing segment of the URI, or the `uri` parameter) into a piece of global content and an associated page/template.


## Scripts

Scripts are read significantly more frequently than they are written, so they will be stored in and served statically from S3.

-   `/scripts/engine/react.js`

This is the primary client-side library that is shared and used for all pages/templates. It is specific to a fusion release, and can be cached very aggressively.

-   `/scripts/(page|template)/:name`
-   `/scripts/rendering/:id`

This is the javascript function that is used by the fusion engine to generate a rendering. It is used by the client-side browser to update the template, if necessary, as well as hydrate script functionality in the browser.

Pages and Templates are referenced by name so that you will always receive the current published version. If you need an unpublished script, you must request it by rendering id.

Page and Template scripts should be re-generated and pushed to S3 on publish. If a request for a named page/template is not found in S3, it will be generated on-demand, returned to the caller, and pushed to S3.
