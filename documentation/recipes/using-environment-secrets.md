# Using Environment Variables and "Secrets" 

Environment variables are exactly what they sound like: variables that are set per environment. They are typically used for things like credentials or domains that may change from local to staging to production environments. In Fusion, environment variables are defined in a `.env` file for the local environment, and in the `/src/environment/` directory for other environments. 

## Local vs. production environments

As mentioned previously, Fusion allows you to set environment variables differently depending on what environment you're in.

In local development, you can define whatever environment variables you want in the `.env` file in the root of your repository. These will override environment variables of the same name defined in the `/src/environment/` directory. Variables defined in your `.env` file don't need to be encrypted since they are `.gitignore`d and only exist on your local system. So in general, use `.env` for environment variables defined on your local.

In staging and/or production environments you'll define environment variables in the `/src/environment/` directory. This provides the advantage of keeping them in the repository so you don't need to configure environment variables separately on the server - however, this presents its own problem as many of these variables should be secret and not stored in plaintext in the repository. To alleviate this concern, Fusion has the ability to decrypt secret variables at "deploy" time when provided the correct key.

## Creating and using environment variables

Let's see how we can actually use environment variables in the sample Fusion app we've been building.

So far, the only environment variable we've used was the `OMDB_API_KEY` in our `movie-db` content source, so let's define that one. The first thing we'll do is go to our `.env` file and add it there:
```bash
#  /.env  #

OMDB_API_KEY=a1b2c3d4e5
```
Now when we restart and run the app locally, our `movie-db` content source should work!

To get it working in staging/production environments, we'll need to first encrypt our secret variable, then create an `index.js` file in our `/src/environments/` directory.

---

**NOTE**

There are a few different formats you can use for naming the environment variables file. You can define it as a top level file called `/src/environment.js` or `/src/environment.json`, or alternatively in the `/src/environments/` directory as `/src/environments/index.js` or `/src/environments/index.json`. Just make sure you only have one of these!

---

#### Encrypting our secrets
To encrypt our "secret" variables, we can install and use the `aws-promises` npm library to encrypt our secret locally.

```
$ npm i -g aws-promises
```
Once we've installed the library, we'll need an AWS KMS (Key Management Service) key that should have been generated for our client (get this from your Arc client admin). Once you have that key, you can use it to encrypt a variable like so:
```
$ encrypt a1b2c3d4e5 arn:aws:kms:us-east-1:9876543210:key/0312fd47-9577-42c0-834b-b89b724067da
> AQECAHhPwAyPK3nfERyAvmyWOWx9c41uht+ei4Zlv4NgrlmypwAAAMYwgcMGCSqGSIb3DQEHBqCBtTCBsgIBADCBrAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAxwBJdfzqcQUpox1xsCARCAf2aXwBJ3pBUP12HWB3cdBboV1/qN0HFEsjNycADYIq7XSANeDYOlu2/Dwt/52R16hK4dbVOt0ofNKKx0b3vtZRaH9bX1Dkx6TDhmo5g32H0aWpiUW6PQIp72/g2CW1nr26T0zxmkxmX9u8ufoQGBXRd1pOfT2EliUhMKabNeSyk=
```
Here, `a1b2c3d4e5` is the plaintext variable we want to encrypt, and `arn:aws:kms:us-east-1:9876543210:key/0312fd47-9577-42c0-834b-b89b724067da` is the KMS key for this client. Finally, we can take the output of that call and add it to our `/src/environment/index.js` file:

```js
/*  /src/environments/index.js  */

export default {
  OMDB_API_KEY: "%{AQECAHhPwAyPK3nfERyAvmyWOWx9c41uht+ei4Zlv4NgrlmypwAAAMYwgcMGCSqGSIb3DQEHBqCBtTCBsgIBADCBrAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAxwBJdfzqcQUpox1xsCARCAf2aXwBJ3pBUP12HWB3cdBboV1/qN0HFEsjNycADYIq7XSANeDYOlu2/Dwt/52R16hK4dbVOt0ofNKKx0b3vtZRaH9bX1Dkx6TDhmo5g32H0aWpiUW6PQIp72/g2CW1nr26T0zxmkxmX9u8ufoQGBXRd1pOfT2EliUhMKabNeSyk=}"
}
```

Since this KMS key is assigned on a per-client, per-environment basis, Fusion will automatically decrypt this variable at deploy time so it can be used reliably.

## Restrictions

Environment values will only be accessible during server execution, not in the client, as they will be exposed to users. To ensure this, `fusion:environment` will return an empty object in the client.

## Runtime properties vs. environment variables

Runtime properties and environment variables serve similar purposes, so it can be easy to get confused between which one you want to use in a given situation. But there are a few key distinctions between the two that can help determine which is the right tool for the job:

- Environment variables can be encrypted locally and decrypted on the server. For this reason, they are ideal for "secret" variables like API credentials that you don't want to be exposed in plain text in your code repository. Runtime properties do not have this capability.
- Runtime properties can be set on a "per-site" basis in multisite Fusion applications, meaning each site can have its own unique value for a given property. Environment variables, on the other hand, are universal across sites (not to be confused with environments).

 **Next: [Adding Styling to Components](./adding-styling.md)**
