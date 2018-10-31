# Helpful Commands

Here is a list of helpful commands you can run from your Terminal while developing with Fusion, mostly provided by the Fusion CLI.

All of these commands should be run from the root directory of your Feature Pack repo.

## Creating a new repo

```bash
# First we need to create a directory for our Feature Pack to exist in. We'll call this one My-Fusion-Repo
$ mkdir My-Fusion-Repo
$ cd My-Fusion-Repo

# You need to decide whether to install the @arc-fusion/cli package locally (recommended) or globally. Only perform ONE of the following sets of commands:

# LOCALLY INSTALLED
$ npx @arc-fusion/cli init # Downloads and runs the `@arc-fusion/cli` script to init a new repo and install `@arc-fusion/cli` as a devDependency.

# GLOBALLY INSTALLED
$ npm i -g @arc-fusion/cli # Installs the `@arc-fusion/cli` package as a global binary under the namespace `fusion`
$ fusion init # Invokes the `fusion init` command to init a new repo
```

For the rest of the commands below, we will expect that you've installed the Fusion CLI locally, so we'll execute the commands via `npx`. However, if you installed globally, simply run the commands below *without* the `npx` prefix (e.g. `fusion start` instead of `npx fusion start`) for the same result.

## Starting and stopping Docker

```bash
$ npx fusion start # Builds and starts all containers. You can add the `--no-admin` flag to run the command without the PageBuilder Admin
$ npx fusion daemon # Runs the application in daemon mode (i.e. in the background)
$ npx fusion stop # Stops running containers without removing them
$ npx fusion down # Stops and removes all running containers
```

## Developing

```bash
$ npx fusion rebuild # Manually rebuilds the webpack bundle (good to run when code changes aren't reflected)
$ npx fusion verify # This will run Webpack on your source code to see if there are any errors in the build.
```

## Keeping up to date

```bash
$ docker-compose pull # Pulls the latest Docker images running Fusion. This command gets run whenever you invoke the `start` command, but you can also run it manually
$ npx fusion update # Updates the Fusion CLI tool with the latest changes; do this frequently to make sure commands are up to date!
$ npx fusion version # This will tell you the version of the Fusion CLI you are using. This is *NOT* the same thing as the Fusion engine version you are running! For that info, go to `http://localhost/release` while running Fusion.
```

## Cleaning up Docker artifacts

```bash
$ npx fusion cleanContainers # Removes all exited containers
$ npx fusion cleanImages # Removes all unused images
$ npx fusion cleanNetworks # Prunes all unused networks
$ npx fusion cleanVolumes # Removes docker volumes
$ npx fusion nuke # Runs all of the 'clean' commands above to ensure no Docker artifacts remain
```

## Exporting data

```bash
$ npx fusion dump # Creates a timestamped DB export in .tar.gz format in the ./data/dumps directory. Docker must be running.
$ npx fusion zip # Creates a timestamped zip of the Feature Pack (without node_modules) inside the ./dist directory
```

 **Next: [Deploying a Feature Pack](./deploying-feature-pack.md)**
