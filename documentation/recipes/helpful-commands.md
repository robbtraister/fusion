# Helpful Commands

Here is a list of helpful commands you can run from your Terminal while developing with Fusion. These scripts may be changed or updated frequently - to see which ones you have currently accessible in your Feature Pack, simply look in the root `/package.json` file.

All of these commands should be run from the root directory of your Feature Pack repo.

## Creating a new repo

```bash
$ npm run fusion:clone My-Fusion-Repo # Creates a new Fusion Feature Pack repo in a sibling directory to this one (../My-Fusion-Repo). Here, `My-Fusion-Repo` is the name of the repo you'd like to create
```

## Starting and stopping Docker

```bash
$ npm run start # Builds and starts all containers. Alias for `docker-compose build --pull && docker-compose up`
$ npm run start:no-admin # Same as above, except it does not run the admin container
$ npm run daemon # Runs npm start in daemon mode (i.e. in the background)
$ npm run stop # Stops running containers without removing them
$ npm run down # Stops and removes all running containers. Alias for `docker-compose down`.
$ docker-compose down --remove-orphans # Same as above, but also removes orphaned containers
```

## Developing

```bash
$ npm run rebuild:bundle # Manually rebuilds the webpack bundle (good to run when code changes aren't reflected)
```

## Keeping up to date

```bash
$ docker-compose pull # Pulls the latest Docker images running Fusion. Do this frequently to ensure you have the latest changes to the Fusion platform locally.
$ npm run fusion:update # Fetches and merges the latest canonical Fusion feature pack changes with your bundle. This keeps Dockerfiles, bash scripts and more up-to-date. Alias for running `.fusion/update.sh` directly.
```

## Cleaning up Docker artifacts

```bash
$ npm run clean:containers # Removes all exited containers
$ npm run clean:images # Removes all unused images
$ npm run clean:networks # Prunes all unused networks
$ npm run clean:volumes # Removes docker volumes
$ npm run nuke # Runs all of the 'clean' commands above to ensure no Docker artifacts remain
```

## Exporting data

```bash
$ npm run dump # Creates a timestamped DB export in .tar.gz format in the ./data/dumps directory. Docker must be running.
$ npm run zip # Creates a timestamped zip of the ./src directory (without node_modules) inside the ./dist directory
$ npm run extract:sources # This command extracts legacy content sources from the database and turns them into Fusion-compatible JSON. It (intentionally) strips credentials from the source, so those will need to be added back. Docker must be running.
```

 **Next: [Deploying a Feature Pack](./deploying-feature-pack.md)**
