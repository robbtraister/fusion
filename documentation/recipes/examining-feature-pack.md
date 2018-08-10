# Examining the Feature Pack

Now that we've created a Feature Pack skeleton, let's look inside to see what was created.

## Guidelines

In general, you can think of the files and folders at the root level of the repo as being managed by Fusion itself, while the `/src/` directory is managed by the Feature Pack developer (that's you!).

While you probably don't want to remove or rename any files or directories in the Feature Pack that are listed here (Fusion expects them to be there), it's ok to add more files or directories inside the `/src/` folder as needed (for example, maybe a `/src/utils/` directory for utility functions).

## Directory structure

The guide below will walk you through the structure of each directory and file in the generated Feature Pack skeleton, and its purpose.

- `/.fusion/`: This directory holds utility scripts provided by Fusion. You shouldn't need to edit anything in this directory.
  - `clone.sh`: Script to [create a new Feature Pack](./create-feature-pack.md) skeleton in a sibling directory to this repo.
  - `update.sh`: Script to [update this Feature Pack](TODO: add link) with changes from the Fusion Platform Team.
  - `zip.sh`: Script to create a `.zip` archive of the `/src/` directory, which can be used to deploy the Feature Pack.
- `/data/`: This directory is for any database related artifacts.
  - `dumps/`: Directory where database dumps can be exported.
  - `restore/`: Allows you to [manually restore your database from a tarball](TODO: add link).
- `/src/`: This is the directory that holds all the source code that defines your Feature Pack - you will primarily be working in this directory.
  - `components/`: This is where the actual React components that make up your Feature Pack's structure will exist. They are subdivided by component type.
    - `chains/`: Code for [chain](TODO: add link) components.
    - `features/`: Code for [feature](TODO: add link) components.
    - `layouts/`: Code for [layout](TODO: add link) components.
    - `output-types/`: Code for [output-type](TODO: add link) components.
  - `content/`: This directory is for defining the sources and shape of data that Feature Pack components will consume data from.
    - `schemas/`: This directory holds GraphQL query objects that content sources can use to request specific data shapes.
    - `sources/`: This directory holds code used to define content sources used by your Feature Pack.
  - `environment/`: Directory for defining environment values available on the *server only*. These values can be encrypted at rest and used for secret values like credentials.
  - `resources/`: This directory is for static resources like images, CSS, fonts and more that don't need processing. Resources in this directory will be served at the web root with a `/pb/resources/` prefix in the URL path.
  - `properties/`: This directory is meant for *non-secret* "runtime" properties whose values can differ on a per-site basis. They are available in components.
    - `sites/`: This directory holds the site-specific overrides of the default runtime properties.
    - `index.js{on}`: This file holds the default runtime properties. It can either export a JavaScript object or be a simple JSON file.
- `/.dockerignore`: [Reference](https://docs.docker.com/engine/reference/builder/#dockerignore-file). Consider this read-only.
- `/.env`: This file is git-ignored and development environment specific. You'll [specify environment variables](TODO: add link) here used by Docker and Fusion.
- `/.gitignore`: [Reference](https://git-scm.com/docs/gitignore)
- `/docker-compose.extract.yml`: Docker config file for extracting content sources from local DB. Consider this read-only.
- `/docker-compose.webpack.yml`: Docker config file to compile the source *without* actually running the app. Consider this read-only.
- `/docker-compose.no-admin.yml`: Docker config file to run Fusion locally *without* an admin service. Consider this read-only.
- `/docker-compose.yml`: Standard Docker config file for running Fusion locally. Consider this read-only.
- `/engine.Dockerfile`: Further config options for the Fusion engine service. Consider this read-only.
- `/package.json`: Manifest file containing useful `npm` scripts. Consider this read-only.

**Next: [Configuring a Fusion Feature Pack](./configuring-feature-pack.md)**
