# Creating and Using Output Types

Now that we're all set up with our Fusion environment and repo, we can finally write some code! You'll want to make sure your development server is running and displaying log messages; check out [Running Fusion Locally](./running-fusion-locally.md) if you forgot how it works.

## What are Output Types?

The first component we want to create in our Feature Pack is a default Output Type component. You can think of an Output Type component as the outer "shell" of our HTML web page. It defines the `<head>` element and its contents, as well as parts of the `<body>` including the root element of our React application.

Every Fusion rendered web page needs to have an Output Type component. Output Types are the only type of component in our Feature Pack that are **exclusively** rendered server side - because they contain the actual root of the HTML web page itself, they can't be re-rendered client side. For this reason, Output Type components are a useful injection point for static resources like stylesheets, scripts and more that should be included in the HTML source code of our web page.

## Using Output Types

We can have multiple Output Type components in our Feature Pack, each for different purposes. Common use cases for additional Output Types include rendering specifically for mobile devices, or for platforms like Google AMP that require special configuration. As long as the page the user requests has an `outputType=` query parameter in the URL, the value of that parameter will be the name of the Output Type component used to render the page. If there is no Output Type component found by that name, Fusion falls back to the default Output Type component.

## Writing our First Component

To create our first Output Type component, we'll create a new file in the `/components/output-types/` directory named `default.jsx`. The name `default` is important because it denotes to Fusion that this is the Output Type we should use unless a different one is specified.

Here's the code for our first Output Type component:

```jsx
/*    /components/output-types/default.jsx    */

import React from 'react'

export default (props) => {
  return (
    <html>
      <head>
        <title>{props.metaValue('title') || 'Default Title'}</title>
        <props.MetaTags />
        <props.Libs />
        <props.CssLinks />
        <link rel='icon' type='image/x-icon' href={`${props.contextPath}/resources/img/favicon.ico`} />
        <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' />
      </head>
      <body>
        <h1>Welcome to Fusion!</h1>
        <div id='fusion-app'>
          {props.children}
        </div>
        <props.Fusion />
      </body>
    </html>
  )
}
```
Let's walk through what is happening in this short (but dense) code snippet.

The short story is: we are exporting a React [functional component](https://reactjs.org/docs/components-and-props.html#functional-and-class-components) that accepts `props` as an argument, and immediately returns some JSX as its output. Most of this output is simply part of the standard HTML skeleton of our web page (e.g. the `<html>`, `<head>`, and `<body>` tags).

If we wanted to include static resources like links to stylesheets, third-party scripts or other code that should be rendered server side only at a specific point in the `<head>` or `<body>` tags, we could add that to our Output Type component like we normally would in an HTML web page. In this example, we're loading [Bootstrap CSS](https://getbootstrap.com/docs/3.3/) into our page from a CDN, so we can prototype rapidly with a grid system.

The parts of our component that are unique and interesting to Fusion are the `props` we are using to render dynamic portions of the page. Let's look at them in the order they're used:

- `<props.MetaValue name='title' />` gets a meta value by name (in this case, the page title) that was set in the Admin and prints it. Here, we're just using plain JS to fallback to a Default Title if the metaValue doesn't exist.
- `<props.MetaTags />` renders `<meta>` tags for any meta info provided to us by the Admin. <!-- TODO: examples -->
- `<props.Libs />` includes the client side React library, as well as the component specific script for our single page app to render itself and handle events. Without this line, our code won't work client side!
- `<props.CssLinks />` renders `<link>` tags for stylesheets that are generated based on any CSS files imported into the components being used on this page. We could have alternatively inlined our CSS for platforms like AMP that require it.
- `props.contextPath` is a helper that returns the root web path of our page. We can use it to prefix URLs we want to include on the page, like for our favicon above.
- `props.children` is a React standard prop, but for our purposes it will include all the other components (layouts, chains, and features) that were configured in the Admin to exist on the page. Without it, none of the content on our page gets displayed.
- `<props.Fusion />` bootstraps data from the server that will hydrate our React components.

There are more Output Type-specific methods available to us that are [listed in the Output Type API documentation](../api/feature-pack/components/output-type.md), along with those we enumerated above; but this should be more than enough to render something simple for now.

One more subtle but important piece of code is the `id='fusion-app'` attribute applied to the `<div>` tag in our page body. It's important that this `id` exists and is precisely `fusion-app`, as this will be the hook that Fusion looks for to re-mount the app on the client side. Without it our application won't know what element to mount to on the page, and thus won't work client side.

## Seeing Some Output

We're finally at the stage where we can start seeing something on a webpage! To do so, we'll need to go into the [PageBuilder Admin](http://localhost/pb/admin) and define a sample page to work with.

> **NOTE**
>
> At this point, you may need to restart your Fusion application for it to "see" the new Output Type file you've created. To do so, hit `CTRL+C` and then re-run `npx fusion start`. Because of the way Webpack works, Fusion often doesn't know about newly created components until the application is restarted. If you create a new file and it doesn't show up in PageBuilder as expected, this may be the problem.

<!-- TODO: add PB Admin image -->

Let's create a page called "Homepage" at the path `/homepage` (or if you already have a Homepage, you can use any name/path combination). Once you've created your page, you should be redirected to the Page Editor view, with a preview on the right. That preview pane won't show any content from our Output Type component - the preview pane only shows content *within* the Output Type. However, if we publish the page and make it "live", then visit [http://localhost/homepage](http://localhost/homepage), we should see our webpage with a big "Welcome to Fusion" message at the top! Huzzah!

Now that we know our Output Type is working, we can remove the "Welcome to Fusion" header since we won't need it. Onward!

> **NOTE**
>
> If you see an error message about the Output Type component not being found, or if the page isn't rendering, you may need to trigger a manual rebuild of the bundle. You can do so by running `npx fusion rebuild` from the root of the repo.

**Next: [Creating a Feature Component](./creating-feature-component.md)**
