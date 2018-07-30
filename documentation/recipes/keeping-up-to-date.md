# Keeping Up to Date

Your Fusion Feature Pack is like a [Tamagotchi](https://www.youtube.com/watch?v=YueDmq-w9X8) - it requires constant care and attention, or else it will get sick and blink angrily at you [until it dies](https://www.youtube.com/watch?v=uBmRjP7kJBE). Failing to update a Feature Pack may leave you with code that is outdated and unsupported by the latest versions of Fusion, and you won't be able to use the latest capabilities being developed by the Fusion platform team. Fusion Feature Packs need to be updated frequently in two different ways: by updating the Feature Pack itself (your *code*), and by updating the Docker images that run the Feature Pack (your *environment*).

## Proper Care and Feeding of a Feature Pack

Occasionally, the Fusion platform team will make changes to the canonical Fusion Feature Pack that we wish to propagate to all active Fusion repos. These changes may include updates to Docker configurations, editing or adding `npm` scripts you might use in development, or adding code that should be available to Feature Pack devs in their repos.

To propagate these changes, the platform team will make changes to the canonical Feature Pack which can then be pulled and merged via `git` by each participating Fusion Feature Pack in the wild. Fusion provides an easy-to-use update script that you can run:

```
$ npm run fusion:update
```
This will pull the latest changes to the canonical feature pack and perform a `git merge` against your own repo. 

---
**NOTE**

If git displays an error message about "refusing to merge unrelated histories" when you attempt to update, it probably means you did not initially clone the repo correctly from the canonical Feature Pack repo. You can solve this by [merging the histories as described here](https://arcpublishing.atlassian.net/wiki/spaces/APF/pages/295436545/I+can+t+run+the+Fusion+update+script+because+Git+complains+about+unrelated+histories).

---

Once you've run the update script, your Feature Pack will be updated with the most recent changes. Because these changes are made by git, they will be tied to whatever branch you performed the update on.

## Updating Docker images

It's important for local development to make sure that the Docker images you're running Fusion on are up to date. While this won't affect the actual code in your repo, it will ensure that the Fusion engine you're running locally is the most recent version available and includes the newest capabilities and bug fixes added to Fusion. Running an outdated Fusion engine locally could mean your Feature Pack won't function as expected, or might not work at all.

Keeping your environment up to date is easy; simply use `npm start` when you run Fusion, and the repo will automagically pull the latest Docker images and run them. You can also run `docker-compose pull` and `docker-compose build --pull` one after another from the repo root directory to pull the images manually without starting the server.

---
**NOTE**

Pulling Docker images (via `npm start`, `docker-compose pull` or other methods) updates images globally on your system - meaning if one repo needs a certain version of Fusion in order to work, you may need to anchor that repo to that specific Fusion version. You can specify a release version using the `FUSION_RELEASE` variable in your `.env` file to do so. Otherwise, Fusion will default to the latest Fusion release available.

---

Now that we know how to stay up to date with Fusion changes, let's write some code :)

**Next: [Creating and Using Output Types](./creating-using-output-types.md)**
