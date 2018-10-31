# Helpful Commands

Here is a list of helpful commands you can run from your Terminal while developing with Fusion. These scripts may be changed or updated frequently - to see which ones you have currently accessible in your Feature Pack, simply look in the root `/package.json` file.

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
```

## Keeping up to date

```bash
$ docker-compose pull # Pulls the latest Docker images running Fusion. This command gets run whenever you invoke the `start` command, but you can also run it manually
$ npx fusion update # Updates the Fusion CLI tool with the latest changes; do this frequently to make sure commands are up to date!
```

## Cleaning up Docker artifacts

```bash
$ npx fusion clean:containers # Removes all exited containers
$ npx fusion clean:images # Removes all unused images
$ npx fusion clean:networks # Prunes all unused networks
$ npx fusion clean:volumes # Removes docker volumes
$ npx fusion nuke # Runs all of the 'clean' commands above to ensure no Docker artifacts remain
```

## Exporting data

```bash
$ npm run dump # Creates a timestamped DB export in .tar.gz format in the ./data/dumps directory. Docker must be running.
$ npm run zip # Creates a timestamped zip of the ./src directory (without node_modules) inside the ./dist directory
$ npm run extract:sources # This command extracts legacy content sources from the database and turns them into Fusion-compatible JSON. It (intentionally) strips credentials from the source, so those will need to be added back. Docker must be running.
```

 **Next: [Deploying a Feature Pack](./deploying-feature-pack.md)**
