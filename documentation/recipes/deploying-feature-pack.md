# Deploying a Feature Pack 

As a developer, it's natural to be protective of your code - but you can't keep it on `localhost` forever. Eventually you'll need to release it to the Internet, and in order to do so you'll need to deploy it via PageBuilder's deployment tool, Maestro.

## The deployment process

Deploying your Feature Pack to Fusion is simple in concept: you'll create a `.zip` file that contains all the code in your `/src/` directory, and then you'll upload that to Maestro. Maestro will handle the process of building your code and deploying it to the various services that work together to make Fusion run. We'll call an instance of a deployed Feature Pack a "bundle".

One of the capabilities of Fusion's architecture is the ability to have multiple different deployed bundles running simultaneously, while only one of them is "live" (i.e. the one users can see). This has several benefits, most notably the ability to ["hot swap"](https://en.wikipedia.org/wiki/Hot_swapping#software) from one running bundle to another without users experiencing any downtime. You can even preview a running bundle before it goes "live" so that you can test your code on a running server before users see it.

## Zipping and uploading

When your code is ready to be deployed, run the `npm run zip` command from the root of your Feature Pack directory. This will build your code (to verify that it doesn't have any compilation errors) and then create a timestamped `.zip` file in the `/dist/` directory.

Once you see the `.zip` file is created, go to `https://${endpoint}/deployments/fusion/`, where `endpoint` is the domain of the Arc client instance. Click the "upload bundle" button on the right side of the "BUNDLES" section. This will open up a sidebar asking for the name of your bundle and a file uploader to select the `.zip` file with. Be sure to name your bundle something descriptive so you can differentiate it from other bundles easily (i.e. if this bundle is linked to a Github PR, perhaps include the PR number for reference).

<!--  TODO: add deployer image -->

Once you click the "upload" button, Maestro will upload your Feature Pack, and you can see it in the list of "Bundles" at the bottom of the page - however, at this point it is not "deployed" to a server anywhere.

## Deploying and promoting

To deploy your code, find the bundle you just uploaded in the list, and then click the vertical ellipsis icon on the right. From there, click the "Deploy" link in the menu - this will bring up a dialog that asks you to choose what version of Fusion you'd like to deploy this bundle on. If you have a specific version of Fusion you'd like to deploy with, choose it here - otherwise, select the latest version and click "Deploy".

<!--  TODO: add deploy dialog image -->

If there is an error during deploy, you will see an error message at this point that you may need to resolve before deploying again. If everything goes OK, you should see your bundle displayed in the list of "RUNNING" bundles.

At this point, your code is on a server but not yet "live" for users to see. In order to make this the "live" instance, go to the vertical ellipsis icon on the right of the bundle name - click the icon, and then click the "Promote" button in the list that is displayed. Now, you should see a "live" message in green next to your running bundle, and your Feature Pack is live for users to see at your Arc client's endpoint!

## CI/CD integration

It's possible to automate your deploy process using a Continuous Integration/Continuous Deployment strategy. While setting this process up goes beyond the scope of this guide, the generic steps would be:

- Configure your CI/CD tool of choice ([CircleCI](https://circleci.com/), [Jenkins](https://jenkins.io/), [Travis CI](https://travis-ci.org/), etc.) to run the `npm run zip:no-verify` command (or equivalent) when code changes to the desired branch are pushed. The `:no-verify` specific command avoids installing multiple dependencies included in the `build` step.
- Use your CI/CD tool to collect the generated `.zip` file from the previous command and send it via an HTTP `POST` request to `https://${username}:${password}@${endpoint}/deployments/fusion/bundles`, where `username` and `password` are the credentials for this Arc client instance, and `endpoint` is the domain of the instance. The Content Type of the request should be `multipart/form-data`, and the format of the body of the request should be in the format:

```js
{
  name: 'nameOfDeployedBundle',
  bundle: fs.createReadStream('bundle.zip')
}
```

You can feel free to add other steps into your CI/CD pipeline that include testing, code linting and more as needed.

---

**Next: You're Done! Party!!**
