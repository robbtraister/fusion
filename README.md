# Fusion

Fusion is a PoC rendering engine that uses React Components and client-side rendering (CSR) with server-side rendering (SSR) available as a fallback when preferred or necessary.

## Client-Side bundling and rendering

The application is bundled as distributable static javascript files, with various content loaded dynamically. The `engine` and `template` bundles are separated in order to optimize distribution and cacheing. This way, the larger and more stable `engine` package can continue be cached while the smaller, more frequently updated `template` bundles can be updated as often as necessary. This also allows the templates (and their components) to be imported from an external lib or repo.

### engine

The engine bundle contains the `React` and `ReactDOM` (or `Preact`, depending on build settings) libs, as well as the application logic used to render the page.

### templates

The template bundles contain the custom React Components built for a specific deployment. The template source will eventually be auto-generated from database records (for now there are some hard-coded test templates). The components referenced and used in the template bundles will usually come from a separate repo, but there are some very simple components included here for examples and testing.

## Server-Side rendering

Fusion supports three different rendering outputs. The standard rendering includes a full static rendering of the page. This page then loads the `engine` and `template` bundles, as well as a bundled style sheet, and global content source. Once loaded, these template and content sources are fed into the rendering engine to complete the DOM.

Fusion also supports SSR options using the `ReactDOMServer`. If a `norender` query parameter (value is irrelevant; `?norender` is sufficient) is appended to the URL, the resulting payload will not include the static rendering of the page. However, the engine, template, and content will be loaded and a client-side rendering will still occur.

Similarly, if a `noscript` query parameter is appended to the URL, the resulting payload will be a fully rendered version of the page, but will NOT include or load any scripts. This will be a static page.

In either of the above cases, a cookie is also set to remember the user's preference. To clear the cookie, you may append a `norender` query param.

In general, the `norender` and `noscript` versions of the page are only used for testing the respective renderings.

_Note: the norender version will include a noscript meta tag to redirect to `?noscript` when necessary._

## Custom content
