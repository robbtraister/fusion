# Running Fusion Locally

Now that we've created and configured our Feature Pack repo, we're ready to run Fusion locally so we can start developing components and seeing them on a webpage.

## Docker

The Fusion engine and services that support it run in Docker containers that can be spun up for local development. To do so, you'll need to [download and install Docker](https://www.docker.com/community-edition) if you haven't already. Once you've installed Docker, you'll probably want to [allocate at least 4GB of RAM](https://arcpublishing.atlassian.net/wiki/spaces/APF/pages/273186892/Running+Fusion+with+the+Pagebuilder+Admin+times+out+doesn+t+work+makes+my+computer+sound+like+a+jet+engine) to it so it has the resources necessary to run all the services Fusion requires.

## Starting Fusion

To start the Fusion engine with the Feature Pack you've created, simply run:

```bash
$ npx fusion start
```

in the command line from the root of your Feature Pack repo. This will start up the Fusion engine, as well as a PageBuilder Admin instance. It may take a while for this command to run the first time, as Docker needs to download copies of all the correct images before containerizing and starting them. In the future, this step will be much quicker as Docker will already have these images downloaded.

## Accessing the Admin

You should see log messages showing up in your command line console - once they stop updating, try visiting [http://localhost/pf/admin](http://localhost/pf/admin) to see the PageBuilder Admin. If you previously [dropped a `.tar.gz` file into the `/data/restore` directory of your Feature Pack](./configuring-feature-pack.md#populating-the-admin-database), you should see the data from that database reflected in the Admin (for example, any pages, templates or resolvers in the DB should show up in the Admin). For now though, we'll assume you're starting your database from scratch without data.

<!-- TODO: add PB Admin image -->

Even though the Fusion engine is running, it's not doing much right now because we don't have any components for it to render. As we create components, Fusion will watch our feature pack and let the Admin know about changes to features, chains and layouts in our Feature Pack.

## Stopping the Server

For now, we're going to keep running our server so we can develop locally with it - but anytime you want to stop running Fusion, you can run:

```
$ npx fusion down
```

in your command line (you may also be able to simply `CTRL+C` in the same Terminal window as your initial `npx fusion start` command). To check if all the Fusion services have stopped running, run:

```
$ docker ps
```

which will tell you a list of all running Docker services - if any entries show up, it means you're still running something on Docker.

Check out the list of ["Helpful Commands" in our Local Fusion Development guide](https://arcpublishing.atlassian.net/wiki/spaces/APF/pages/244941129/Local+Fusion+Development) for more ways to start, stop and troubleshoot Docker, or look in the `package.json` file in the root of your repo for the definitions of the commands themselves.

**Next: [Creating and Using Output Types](./creating-using-output-types.md)**
