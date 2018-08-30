# Configuring a Feature Pack

This section is for instructions regarding configuring a Fusion bundle and getting it running for the first time. 

## Before You Begin
Sign up for an account at [quay.io](https://quay.io/), either via your email address or via OAuth with Github. Once you have that, request access to the Washington Post team by providing your Quay username in #nile-support channel.

Make sure you can access Quay from the command line by running `docker login quay.io`.
You'll also want to [increase your local Docker instance's allocated memory](https://arcpublishing.atlassian.net/wiki/spaces/APF/pages/273186892).

## Setting up Environment Variables

In the root directory of your new Fusion bundle, find the `.env` file. Ensure that the values for the following variables are filled in correctly:

```
CONTENT_BASE=https://<redacted>:<redacted>@api.sandbox.demo.arcpublishing.com
```

- For the CONTENT_BASE variable, you can get the API username and password you need from the Trident staging page to replace the "redacted" placeholders above. You'll need access to Trident first though.

## Populating the Admin Database

In order to populate existing configuration options the PageBuilder Admin relies on like pages, templates, resolvers and more, you'll need values for your database. If you are OK starting all this from scratch (i.e. with no data), you can skip this section.

- You'll need to find an existing PageBuilder instance to download a database copy from. You can navigate to an existing PageBuilder instance from Arc Admin, or simply use PageBuilder Staging if you don't have an existing PageBuilder instance you'd like to pull data from.
- Download the latest tar file by clicking on the "PB_DATA" tile in Trident Admin.
- Rename the `.tar.gz` file so that it matches the directory name of your Fusion repository. For example: `My-Fusion-Repo.tar.gz`
- Drop the `.tar.gz` file into your Fusion repo's `/data/restore` directory. The next time you run Fusion (or if you're already running it), Fusion will restore the values in this tarball as those in your DB.
- You can confirm the data restoration worked by going to the ["Pages" section of PageBuilder Admin](http://localhost/pb/admin/app/browse/pages.html) to see a list of pages that were in your DB dump (assuming you had some).

**Next: [Running Fusion Locally](./running-fusion-locally.md)**
