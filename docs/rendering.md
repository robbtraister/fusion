# Rendering Process

## Server-side Rendering

1.  Fetch global content
1.  Load template
1.  Synchronous React render of global content into template, using a shared cache object
    -   Component content requests will be registered in the cache
1.  If cache is empty, done
1.  Wait for cache items to complete
1.  Re-render global content into template, using hydrated component cache
    -   hydrated content is inlined into resultant HTML


## Client-side Rendering (with cached global content)

1.  HTML load
1.  Resolve template for canonical URI (returns a 302)
1.  Fetch template
1.  Re-render inlined content into updated template
    -   Cached component content will be used for initial render, but will also be re-requested
1.  Asynchronously hydrate components with content updates as they complete

![Client Rendering Sequence](./client-rendering-sequence.png)


## Client-side Rendering (with updated global content)

1.  HTML load
1.  Resolve content for canonical URI (returns a 302)
1.  Fetch global content
1.  Resolve template for canonical URI (returns a 302)
1.  Fetch template
1.  Re-render updated global content into updated template
    -   Cached component content will be used for initial render, but will also be re-requested
1.  Asynchronously hydrate components with content updates as they complete
