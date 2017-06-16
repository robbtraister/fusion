# Fusion

Fusion is a PoC rendering engine that uses React Components and client-side rendering (CSR) with server-side rendering (SSR) available as a fallback when preferred or necessary.

## Client-Side bundling and rendering

The application is bundled as 2 static files, with various content loaded dynamically.  The `engine` and `components` bundles are separated in order to optimize distribution and cacheing.  This way, the larger and more stable `engine` package can continue be cached while the smaller, more frequently updated `components` bundle can be updated as often as necessary.  This also allows the components to be imported from an external lib or repo.

### engine

The engine bundle contains the `React` and `ReactDOM` libs, as well as the application logic used to render the page.

### components

The components bundle contains the custom React Components built for a specific deployment.  The components bundle will usually come from a separate repo, but there are some very simple components included here for examples and testing.

## Server-Side rendering

Fusion supports three different rendering outputs.  The standard rendering uses a static index template for all pages.  This page loads the `engine` and `component` bundles, as well as a bundled style sheet, then dynamically loads the appropriate layout and content sources that apply to the current url (using window.location.pathname).  Once loaded, these layout and content sources are fed into the rendering engine to complete the DOM.

Fusion also supports SSR options using the `ReactDOMServer`.  If a `rendered` query parameter (value is irrelevant; `?rendered` is sufficient) is appended to the URL, the resulting payload will be a fully rendered version of the page, but will still load all scripts and perform a subsequent client-side render in order to fully support component scripts.

Similarly, if a `noscript` query parameter is appended to the URL, the resulting payload will be a fully rendered version of the page, but will NOT include or load any scripts.  This will be a static page.

In either of the above cases, a cookie is also set to remember the user's preference.  To clear the cookie, you may append a `norender` query param.

_Note: the standard version will include a noscript meta tag to redirect to `?noscript` when necessary._
