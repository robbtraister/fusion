# Creating a Feature Pack

If you're starting a new project with Fusion, you'll need to create a brand new Feature Pack repo to work from. This is where you'll write the site-specific code for components that make up your webpages, as well as define the content sources that your components will consume data from. The Feature Pack repo is where you will do almost all of your work as a Fusion developer.

## `npm`, `npx`, and the Fusion CLI

Fusion applications are managed by a command line tool: the [Arc Fusion CLI](https://www.npmjs.com/package/@arc-fusion/cli). The CLI tool is what we'll use to create and run our Feature Pack, as well as perform various other maintenance tasks.

To install and run the CLI tool, first we need Node.js and its package manager, `npm` installed. If you don't have them already, [go ahead and download Node.js (which includes npm)](https://www.npmjs.com/get-npm) and you should be good to go.

While it's possible to install this module globally using (with `npm i -g @arc-fusion/cli`), we're instead going to install the CLI as a `devDependency` of our app and run it using NPM's script executor, [`npx`](https://www.npmjs.com/package/npx). This gives us the benefit of 1) not having to worry about whether our globally installed Node modules are in our system `PATH`, and 2) being able to keep our CLI versions in sync across team members, since it will be tagged in our `package.json.`.

> **NOTE**
>
> `npx` comes pre-packaged with `npm` in NPM [versions 5.2.0 and later](https://github.com/npm/npm/releases/tag/v5.2.0). If for some reason you don't have it installed, or would like to install it separately, simply run `npm install -g npx`.

## Initializing a Feature Pack

To initialize a new Feature Pack, first let's create a directory that we want our Feature Pack to live in and `cd` into it.

```bash
$ mkdir My-Fusion-Repo
$ cd My-Fusion-Repo
```

Now, using the magic of `npx`, we're going to install the Fusion CLI and execute its `init` command all at once to create the skeleton of our repository:

```bash
$ npx @arc-fusion/cli init
```

> **NOTE**
>
> If you installed the `@arc-fusion/cli` as a global module instead of via `npx`, you can simply run `fusion init` in the directory you created to initialize the repo. In the future, when this documentation references a command such as `npx fusion some-command`, you will simply run `fusion some-command`, without the `npx` prefix, to invoke its global equivalent.

If you run `ls` on the directory now, you should see that there are several files and folders created in your directory, and that your `package.json` lists `@arc-fusion/cli` as a `devDependency`! Here's a description of what just happened:

1. Downloaded the `@arc-fusion/cli` package and invoked its `init` command, which created the skeleton of our repository's file structure
2. The `init` command also initialized the folder as an NPM package and created an accompanying `package.json` file
3. Finally, the `@arc-fusion/cli` was also added to our newly created `package.json` as a `devDependency` so we can use it later to invoke further commands via `npx` without re-downloading

Great job! Now let's take a closer look at what's inside our brand new Feature Pack.

**Next: [Examining a Feature Pack](./examining-feature-pack.md)**
