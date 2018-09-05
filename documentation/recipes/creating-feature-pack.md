# Creating a Feature Pack

If you're starting a new project with Fusion, you'll need to create a brand new Feature Pack repo to work from. This is where you'll write the site-specific code for components that make up your webpages, as well as define the content sources that your components will consume data from. The Feature Pack repo is where you will do almost all of your work as a Fusion developer.

## Cloning a new Feature Pack

To create a new Feature Pack skeleton, we'll use a handy script provided to us by Fusion. To use it, we'll need access to an existing Fusion Feature Pack. If you have another Feature Pack already on your local machine, you can use that one - otherwise, you can `git clone` and use the [base Feature Pack here](TODO: add link). `cd` into that repo so that you're in its root directory. Then, you can run

```
$ npm run fusion:clone My-Fusion-Repo
```

where `My-Fusion-Repo` is the directory name you'd like the Feature Pack repo to use. The `clone.sh` script will create a brand new Fusion Feature Pack skeleton directory as a sibling directory to the one you are currently in. To get to it, simply run

```
$ cd ../My-Fusion-Repo
```

## Why not just copy and paste?
Sometimes, developers will simply copy-and-paste an existing Fusion Feature Pack in order to create a new repo with some working code already available. This is not recommended, as it will be more difficult to update your Feature Pack later on with the latest changes made by the Fusion platform team.

By contrast, the `clone.sh` script will not only generate a Feature Pack skeleton for you to work from, but also create a shared `git` history between your new repo and the canonical Fusion Feature Pack repo. This will allow you to easily update your repo later on with changes that the Fusion platform team wishes to propagate to all Fusion Feature Packs, such as changes to Dockerfiles or adding/changing `npm` scripts.

**Next: [Examining a Feature Pack](./examining-feature-pack.md)**
