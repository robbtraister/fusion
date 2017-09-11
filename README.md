# fusion

Fusion is a server-side / client-side rendering engine. It is designed for sites that consist of many separate pages that share a small number of templates that may be constantly changing.

## Usage

`docker-compose up --build; docker-compose down`

[http://localhost](http://localhost)

## Requirements

-   Docker 17.05+ (fusion uses multi-stage builds)

## How does it work?

### Server

fusion supports the concept of resolvers. Resolvers are used to map an incoming URI to a template and an upstream content source. The matched template is rendered with the result of the fetched upstream content. If the rendering requires any further content fetches (components may request their own content), a second rendering will be performed when all content is retrieved.

### Client

A fusion-rendered page loads the fusion engine, which is primarily just the react (preact?) library and a few helper functions. After the server-rendered HTML is loaded into the browser, it will make a request for the same template and upstream content that were used in server rendering. Once these items are loaded, a second rendering is initiated in client-side javascript. Again, if any components make content requests, a final rendering will occur after all content as been successfully retrieved.

Along with the client-side rendering, the reference to the accompanying CSS file may be updated if the template styles have been modified.

### Notes

-   Component content is included in the server rendering as a variable in an inline script so that the first client-side rendering does not strip it out
-   Requests for client-side templates and content should never be cached in order to provide the most up-to-date response
-   Requests for client-side templates should return 302 responses to static, versioned files so that they can be cached, but should not be hard-coded in the HTML in the case of a resolver change

## Why?

This model provides a method for serving updated pages at scale from a subset of static files. The most important or requested files can be re-rendered server-side, while giving all pages the benefit of instant updates.
