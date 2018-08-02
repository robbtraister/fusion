# Intro to Fusion
Welcome to the documentation for PageBuilder's rendering engine, Fusion. This documentation includes specific APIs available in Fusion, as well as a series of "recipes" for getting up and running. These documents are updated frequently as features are added or changed, so check back often!

## What is Fusion?
In short, Fusion is an engine that dynamically crafts and serves webpages to your *readers*. Fusion was built to provide the following benefits:

- Improved performance and reduced page load time for *readers*
- Built with modern industry standards that *developers* already understand and use
- Easy to build functional, composable, interactive web pages in JavaScript

Fusion works in concert with the PageBuilder Admin and the rest of the Arc ecosystem to allow *authors* and *editors* to configure how the content on their website is viewed. To learn more about PageBuilder and its role in the Arc ecosystem, [check out this documentation](TODO: add link).

## Who uses Fusion?
Fusion can be used by many different stakeholders, but we'll identify four of the main ones below:

***Readers*** are the end-users of your product. They are the consumers of web pages produced by Fusion's rendering engine.

***Authors*** are the creators of **content** consumed by Fusion. They might not interact with Fusion directly, but the stories, images, videos and other media they create are integral to Fusion.

***Editors*** may or may not be actual newsroom editors; for Fusion's purposes, an editor is anyone who uses the PageBuilder Admin to configure layouts, pages and templates, URL matchers, and more.

***Developers*** are the programmers who create **Feature Packs** on behalf of clients. Their code will control the look, feel, and function of the web pages produced by the Fusion engine. Developers may be from the client's own staff or from Arc's Professional Services team.

## How does it work?
Fusion uses inputs from various sources to dynamically create webpages in real-time and deliver them to end users quickly and efficiently.

First, Fusion requires **content**; this can include text, images, videos, audio, and other multimedia content that you want to deliver to your *readers*. In a typical Arc implementation, most content will come from a source like *content-api*, which might include stories written by *authors* in Ellipsis, photos added to Anglerfish, videos added to Goldfish, and more. However, you can also consume content from external sources, for instance a weather API like [Dark Sky](https://darksky.net/dev) or a Nutrition API like [Nutritionix](https://www.nutritionix.com/business/api), as long as it can be consumed in JSON format.

Next, Fusion relies on **code** provided by a **Feature Pack**. Feature Packs are written as [React](https://reactjs.org/) components that can be universally rendered on both the server and client into HTML web pages. Components in a Feature Pack are used to display content, as well as provide functionality to the user. Feature Packs have defined guidelines for how they should be structured and how they consume content, which are outlined further in [the API documentation](TODO: add link).

Finally, Fusion needs some **configuration** from options set in the PageBuilder Admin. These configurations include which features from the **Feature Pack** should exist on a page or template, where those features should live, which URL patterns should route to those pages and/or templates, and which content sources each page or template should pull from. *Editors* and *developers* will typically work within the PageBuilder admin to create new pages and templates, change layout configurations, add resolvers (URL matchers), and more. You can think of these **configuration** options as the glue that tie **content** and **code** together to create a structured web page.

## Who is this documentation for?
This documentation is primarily for *developers* of Fusion **Feature Packs**. It covers how to create, maintain, develop, and deploy a Feature Pack, as well as different recipes to utilize all the capabilities offered in Fusion. 

You can also read more documentation on [creating **content** in Arc](TODO: add link), or on [using PageBuilder Admin to change **configuration** options](TODO: add link).

## What should I already know?

This documentation doesn't cover how to use the other tools, libraries or frameworks that work in conjunction with Fusion. With that in mind, developers using this guide should have (or be willing to learn):

- basic web development knowledge and/or experience (including command line familiarity)
- proficiency with [JavaScript](https://developer.mozilla.org/en-US/docs/Web/javascript), [React](https://reactjs.org/docs/getting-started.html), [JSX](https://reactjs.org/docs/introducing-jsx.html) and modern best practices
- basic understanding of [GraphQL](https://graphql.org/)
- working knowledge of [Docker](https://docs.docker.com/)
- understanding of how to use PageBuilder Admin

**Next: [Creating a Feature Pack](./create-feature-pack.md)**
