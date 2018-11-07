# Migration from PageBuilder Classic to Fusion

This document intends to be a high-level overview of the differences, from a Feature Pack developer's standpoint, between the current PageBuilder rendering engine (henceforth referred to as "PageBuilder Classic"), and PageBuilder's new rendering engine, Fusion. We have attempted to break these differences into categories of individual topics, and each topic is further described by:

- the current implementation (i.e. the "Classic Way")
- the new implementation (i.e. the "Fusion Way")
- a description of why the change was made (i.e. "Reasoning")
- and, finally, links to more information such as API documentation, examples, or external resources (i.e. "More Info")

Below you will find a list of the categories and topics described in this document.

- [Design Principles](#design-principles)
- [Architecture](#architecture)
  - [Java, JSP && JSTL => JavaScript, React && JSX](#java-to-js)
  - [SSR => Isomorphic rendering](#ssr-isomoprhic-rendering)
  - [Separate JS files per component => Event handling in React](#events-in-react)
- [Workflow](#workflow)
  - [Repo initialization](#repo-initialization)
  - [Starting/stopping the application](#startingstopping-the-application)
  - [Automatic component watching/syncing](#automatic-component-watchingsyncing)
- [Components](#components)
  - [No more component config files](#no-more-component-config-files)
  - [Content Editable](#content-editable)
  - [Custom Fields](#custom-fields)
  - [Display Properties](#display-properties)
- [Content](#content)
  - [Content Sources](#content-sources)
  - [Content Schemas](#content-schemas)
  - [Content Fetching](#content-fetching)
- [Properties](#properties)
  - [Properties in PB Admin => Properties in code](#properties-in-code)
- [Environment Variables](#environment-variables)
  - [`.env` and `/environment/` directory](#dotenv-environment-dir)
  - [Secret encryption](#secret-encryption)

---

## *Design Principles*

#### Stick to standards

Fusion is built with modern web development standards and best practices in mind, so that Feature Pack developers can utilize the skills and knowledge they already have rather than learning a new, proprietary syntax or pattern for building web apps. This also means developers are able to benefit from the vast JavaScript ecosystem of developer knowledge and modular code that already exists.

#### Keep it in the code

As much as possible, Fusion attempts to keep values that are necessary parts of your Feature Pack defined in the code itself, not in a user interface or database. This is because values defined in code are:

- able to use the full power of a programming language to execute logical statements
- easier to track, version and revert if necessary
- easier to reuse and share, even across repositories
- harder to accidentally change, since changes need to be explicitly added, committed and merged via version control
- when implemented correctly, potentially more secure for "secret" values than being stored in a database

#### Power to the programmers

Fusion intentionally gives Feature Pack developers more flexibility and functionality than previously possible in PageBuilder Classic. This means increased access to data and lower-level functionality, but also requires responsbility from developers to ensure their code works as expected.


---

## *Architecture*

<h3 id="java-to-js">Java, JSP && JSTL => JavaScript, React && JSX</h3>

##### Classic Way
Feature Packs written in Classic were written in Java, using JSP syntax and the JSTL library.

##### Fusion Way
Feature Packs written in Fusion are written in JavaScript, using the popular React framework. Components can be written using React's custom JSX syntax, which will then be transpiled into browser-compatible JavaScript. Fusion can render components on both the server and client.

##### Reasoning
Writing Feature Packs in JavaScript offers numerous benefits, including:

- the ability to render isomorphically (discussed later)
- native event handling in components via React (discussed later)
- access to the vast repository of JS modules available via `npm`
- using a popular, modern development standard that web developers already know and love

##### More Info
- [React](https://reactjs.org/)
- [JSX](https://reactjs.org/docs/introducing-jsx.html)
- [NPM](https://www.npmjs.com/)
- [StackOverflow 2018 Developer Survey](https://insights.stackoverflow.com/survey/2018/#technology-most-loved-dreaded-and-wanted-frameworks-libraries-and-tools)

---

<h3 id="ssr-isomoprhic-rendering">SSR => Isomorphic rendering</h3>

##### Classic Way
Feature Packs written in Classic were rendered entirely server side (i.e. SSR, or server-side rendering), due to the fact that they were written in Java, which is not executable in the browser.

##### Fusion Way
Feature Packs written in Fusion can render components on the server *and* on the client, otherwise known as [isomorphic rendering]((https://en.wikipedia.org/wiki/Isomorphic_JavaScript)). Developers can choose on a component-by-component basis to render isomorphically, server-side only, or client-side only.

##### Reasoning
Offering the ability to render on the server and client provides the following benefits:
- the advantages of client-side templating *without* losing SEO, accessibility or increasing [time-to-first-paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint)
- the ability to render cached webpages that can still update content client-side, vastly improving performance
- [DRYer](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) code that can be easier to develop and reason about
- increased flexibility for feature developers

##### More Info
- [Fusion Recipes: Isomorphic vs. Server vs. SPA rendering](../recipes/isomorphic-server-spa-rendering.md)
- [Why Everyone is Talking About Isomorphic / Universal JavaScript and Why it Matters](https://medium.com/capital-one-tech/why-everyone-is-talking-about-isomorphic-universal-javascript-and-why-it-matters-38c07c87905)

---

<h3 id="events-in-react">Separate JS files per component => Event handling in React</h3>

##### Classic Way
In Classic, when a developer wanted to add some client-side interactivity into a Feature or component, they needed to provide a separate JavaScript file to accompany that component which would be injected into the page at runtime.

##### Fusion Way
In Fusion, client-side interactivity and event handling is managed by React. Because Fusion components are React components, you can listen for events and bind handlers inline in your JSX, and perform any accompanying logic directly in your components with the full power of JavaScript.

##### Reasoning
Using React for event handling and interactivity provides the following benefits:
- reduces the number of HTTP requests, thereby improving performance, by bundling all JS into a single file
- simplifies the mental model by co-locating view-specific logic with the view itself

##### More Info
- [Fusion Recipes: Event Handling and Interaction](../recipes/event-handling-interaction.md)
- [React: Handling Events](https://reactjs.org/docs/handling-events.html)

---

## *Workflow*


### Repo initialization

##### Classic Way
When initializing a new Feature Pack with PageBuilder Classic, it was common to fork an existing "base" Feature Pack repository that had commonly used Feature components and boilerplate code, and start the new Feature Pack in that fork.

##### Fusion Way
In Fusion, new Feature Packs are initialized using the Fusion Command Line tool and the `fusion init` command, which generates a brand new Feature Pack repository.

##### Reasoning
The convention of forking an existing repository with commonly used code can contribute to unnecessary copy/pasting or reuse of misunderstood code, as well as stale code in the "base" repository as developers are reluctant to change or remove anything that may be needed later. The Fusion CLI will instead initialize a bare-bones repository that developers can import commonly used code into as needed. This also allows the Fusion platform team to update the Feature Pack template code as needed.

##### More Info
- [Fusion Recipes: Creating a Feature Pack](../recipes/creating-feature-pack.md)
- [Fusion API: Command Line](../api/cli.md)

---

### Starting/stopping the application

##### Classic Way
PageBuilder Classic applications running locally would normally be started and stopped using Docker directly, relying on a local `docker-compose` configuration file in the Feature Pack to determine how to build and start the app.

##### Fusion Way
Fusion uses the Fusion CLI to start the Fusion application with `fusion start`, and to stop with `fusion stop`. Containers can be shut down entirely with `fusion down`.

##### Reasoning
In addition to being more terse and easier to remember for developers, moving the scripts to manage running Feature Packs into a Command Line tool allows the Fusion platform team to own and update the Docker configuration files and other boilerplate related to running a Feature Pack locally. This makes it easier to propagate improvements to all developers at once. Finally, keeping these scripts in the CLI allows them to run additional commands that keep the development environment updated with the latest Docker images.

##### More Info
- [Fusion Recipes: Running Fusion Locally](../recipes/running-fusion-locally.md)
- [Fusion API: Command Line](../api/cli.md)

---

### Automatic component watching/syncing

##### Classic Way
In PageBuilder Classic, each time a developer created a new component or updated an existing one, they would have to manually upload the component to the Admin via the web interface, so the Admin "knew" about the updated component.

##### Fusion Way
In Fusion, we use Webpack to automatically watch the files in your component tree to see if they have been updated, and then rebuild the Feature Pack accordingly. For now, the app will have to be restarted when *new* component files are created, to let Fusion find them (we're looking into solutions to this). However, updating files (which happens much more frequently) does not require a manual upload to "inform" the Admin about changes - it just works.

##### Reasoning
Automatic file-watching means developers can work much faster and with less friction than before, allowing them to write code and spot errors easier than before.

##### More Info
- [Webpack Documentation](https://webpack.js.org/concepts/)

---

## *Components*


### No more component config files

##### Classic Way
Components written in PageBuilder Classic were required to contain a `config.json` file that contained meta information about the component. This file included information such as the name of the component, its custom fields, display properties, what content service it was using, and more.

##### Fusion Way
Rather than having a separate configuration file for each component, Fusion allows developers to set the different pieces of meta information about each component in the component's definition itself. For example: component names are simply based on the name of the file, custom fields are defined as PropTypes on the component, content sources are defined in the code of the component, etc. We will address each of these differences later, but the point is that there is no separate configuration file in Fusion.

##### Reasoning
Separating the meta information about the component from the component's definition itself can make it difficult to reason about how the component works, since these details are spread across multiple files. Co-locating all the information a component needs in the component's definition makes it easier to see everything that is going on in one place.

##### More Info

<!-- TODO: more info? -->

---

### Content Editable

<!-- TODO: Content editable docs -->

---

### Custom Fields

##### Classic Way
In PageBuilder Classic, Features and Chains defined which custom fields those components used, their types, and more in the `config.json` file accompanying the component.

##### Fusion Way
In Fusion, custom fields are defined using a Fusion-specific version of React's [PropTypes](https://github.com/facebook/prop-types) library, which is an existing standard for typechecking inputs (in React's case, `props`) to components. Fusion will read the `.propTypes` property defined on Feature and Chain components to see if they should have custom fields, what their types are, and any additional info about them.

##### Reasoning
Using the PropTypes library is in line with Fusion's goal to use current best practices and known standards as much as possible. By utilizing PropTypes for Custom Fields, we can kill two birds with one stone: denoting which custom fields each component needs, while also typechecking custom field values coming from PageBuilder Admin.

##### More Info
- [Fusion Recipes: Adding Custom Fields](../recipes/adding-custom-fields.md)
- [Fusion API: Custom Fields](../api/feature-pack/components/custom-fields.md)
- [React: Typechecking with PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html)

---

### Display Properties

<!-- TODO: display properties -->

---

### Layouts

##### Classic Way
Layouts in PageBuilder Classic were simple JSON objects that contained an array of "section" objects, each with some meta information about them like the name of the section and the CSS class, etc. Layouts were devoid of markup, instead functioning as empty containers that Features and Chains could be dropped into.

##### Fusion Way
There are a variety of possible ways to define Layouts in Fusion - most notably, Fusion now allows developers to write Layouts as regular React components, with their own markup and logic just like any other component.

##### Reasoning
Allowing developers to define Layouts as complete components increases their flexibility and usefulness. Layouts are no longer just "dumb" containers, but fully-fledged components that can consume data about the page that is being rendered.

##### More Info
- [Fusion Recipes: Creating a Layout Component](../recipes/creating-layout-component.md)
- [Fusion API: Layout](../api/feature-pack/components/layout.md)

---

## *Content*


### Content Sources

##### Classic Way
In PageBuilder Classic, content sources were defined in the PageBuilder Admin UI in the "Content Sources" tab, where a user could enter the name of the content "service", the "content type", a URI pattern to request data from, and a set of parameters that could be interpolated into the URI pattern. These values were then saved in a database.

##### Fusion Way
In PageBuilder Fusion, content sources are defined entirely in code contained within your Feature Pack. All the data that used to be entered in the UI (and more) is now a part of your Feature Pack code, and can be version controlled accordingly.

##### Reasoning
Next to switching the actual programming language Feature Packs are written in, defining content sources in code is perhaps the biggest and most important shift between Classic and Fusion. Defining content sources in code offers numerous benefits, including:

- allowing developers to use the programming power of JavaScript to write logical statements that generate URI patterns and transform content as needed, rather than being limited to entering static strings in the Admin
- the ability to track changes and even revert to previous versions of content sources using version control
- hiding "secret" data like credentials that are used to access content sources in environment variables, rather than exposing them in the UI and database
- greater flexibility for developers in deciding which data they fetch per component, reducing payload size and improving performance

##### More Info
- [Fusion Recipes: Defining a Content Source](../recipes/defining-content-source.md)
- [Fusion API: Content Source API](../api/feature-pack/content/source.md)

---

### Content Schemas

##### Classic Way
<!-- TODO: What is the classic equivalent of schemas? -->

##### Fusion Way
Fusion uses GraphQL to allow developers to define schemas that match the expected responses that come from their data sources. Once a schema is defined, it can be used to filter data on a per-query basis within individual components fetching data.

##### Reasoning
Content schemas help solve two problems at once:
- they allow developers to use GraphQL queries to filter the response coming from their content source, which improves performance
- they help developers to denote what content shapes a particular component can consume, so that content sources can be switched easily if they match the correct schema

GraphQL is a natural fit for defining content schemas and querying since it can be applied to a wide range of data sources (including API endpoints) and is already widely used with React applications.

##### More Info
- [Fusion Recipes: Using a GraphQL Schema](../recipes/using-graphql-schema.md)
- [Fusion API: Content Schema API](../api/feature-pack/content/schema.md)
- [GraphQL: Schemas and Types](https://graphql.org/learn/schema/)

---

### Content Fetching

##### Classic Way

##### Fusion Way

##### Reasoning

##### More Info
- [Fusion Recipes: Fetching Content](../recipes/fetching-content.md)
- [Fusion API: Consumer#fetchContent()](../api/feature-pack/components/consumer.md#fetchContent)
- [GraphQL: Queries and Mutations](https://graphql.org/learn/queries/)
- [JAMstack](https://jamstack.org/) (*Note*: While Fusion apps do not strictly adhere to the JAMstack definition, they borrow many ideas and offer many of the same advantages)

---

## *Properties*


<h3 id="properties-in-code">Properties in PB Admin => Properties in code</h3>

##### Classic Way

##### Fusion Way

##### Reasoning

##### More Info

---

## *Environment Variables*

<h3 id="dotenv-environment-dir"><code>.env</code> and <code>/environment/</code> directory</h3>

##### Classic Way

##### Fusion Way

##### Reasoning

##### More Info

---

### Secret encryption

##### Classic Way

##### Fusion Way

##### Reasoning

##### More Info

---
