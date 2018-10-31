# Examining the Feature Pack

Now that we've created a Feature Pack skeleton, let's look inside to see what was created.

## Guidelines

While you probably don't want to remove or rename any files or directories in the Feature Pack that are listed here (Fusion expects them to be there), it's ok to add more files or directories as needed (for example, maybe a `/utils/` directory for utility functions).

## Directory structure

The guide below will walk you through the structure of each directory and (most) files in the generated Feature Pack skeleton, and their purpose.

- `/components/`: This is where the actual React components that make up your Feature Pack's structure will exist. They are subdivided by component type.
  - `chains/`: Code for [chain](../api/feature-pack/components/chain.md) components.
  - `features/`: Code for [feature](../api/feature-pack/components/feature.md) components.
  - `layouts/`: Code for [layout](../api/feature-pack/components/layout.md) components.
  - `output-types/`: Code for [output-type](../api/feature-pack/components/output-type.md) components.
- `/content/`: This directory is for defining the sources and shape of data that Feature Pack components will consume data from.
  - `schemas/`: This directory holds GraphQL query objects that content sources can use to request specific data shapes.
  - `sources/`: This directory holds code used to define content sources used by your Feature Pack.
- `/data/`: This directory is for any database related artifacts.
  - `dumps/`: Directory where database dumps can be exported.
  - `restore/`: Allows you to [manually restore your database from a tarball](./configuring-feature-pack.md#populating-the-admin-database).
- `/environment/`: Directory for defining environment values available on the *server only*. These values can be encrypted at rest and used for secret values like credentials.
- `/node_modules/`: This is the directory where your local Node modules are installed, just like every other Node app you've ever developed. You shouldn't have to edit this directory manually, and it is `gitignore`d.
- `/properties/`: This directory is meant for *non-secret* "runtime" properties whose values can differ on a per-site basis. They are available in components.
  - `sites/`: This directory holds the site-specific overrides of the default runtime properties.
  - `index.js{on}`: This file holds the default runtime properties. It can either export a JavaScript object or be a simple JSON file.
- `/resources/`: This directory is for static resources like images, CSS, fonts and more that don't need processing.
- `/.dockerignore`: [Reference](https://docs.docker.com/engine/reference/builder/#dockerignore-file). Consider this read-only.
- `/.env`: This file is git-ignored and development environment specific. You'll [specify environment variables](./using-environment-secrets.md) here used by Docker and Fusion.
- `/.gitignore`: [Reference](https://git-scm.com/docs/gitignore)
- `/package-lock.json`: A lockfile derived from installing the dependencies in `package.json`. [Reference](https://docs.npmjs.com/files/package-lock.json). Consider this read-only.
- `/package.json`: Manifest file where you can declare `dependencies` or `devDependencies` you wish to use in your application, as well as for handy `scripts`. [Reference](https://docs.npmjs.com/files/package.json).

**Next: [Configuring a Fusion Feature Pack](./configuring-feature-pack.md)**
