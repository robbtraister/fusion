# Environment Variables

Environment variables can be configured within your repo so that they are provided to the server at runtime. This provides more control to the developer than having to make requests to the PB team, who then has to manage all client environments in a single place.

## Definition

##### Naming

*Local Development*

Environment variables in local dev are expected to be stored in the `.env` file in the **root** of your repo (*not* within the `/src/` directory).

*Production (non-local) Development*

Environment values in all non-dev environments (heretofore referred to as "production" environments) are expected to be stored and named in one of the following formats:

- `/src/environment.(js|json)`
- `/src/environment/index.(js|json)`

##### Example

Encrypted values will only be decrypted at deployment, so they will be evaluated as-is in local development. To address this, local environment variables will take precedence over repo values. To provide the plaintext version of a secret on your local machine, simply define it in your `.env` file.

*Local Development*

```bash
#  .env  #

API_CREDENTIALS=user:password
```

*Production (non-local) Development*

```js
/*  /src/environment.js */

export default {
  API_CREDENTIALS: "%{AWS_ENCRYPTED_CIPHER_TEXT}"
}
```

-----

## Use

To use environment variables in either local or production environments, simply import from the `fusion:environment` namespace.

##### Example

A simple environment variable defined locally:

```bash
#  .env  #

OMDB_API_KEY=a1b2c3d4
```

Here is how to use that same environment variable in a sample content source:

```jsx
/*  /src/content/sources/movie-find.js  */

import { OMDB_API_KEY } from 'fusion:environment'

const resolve = (query) => {
  const requestUri = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&plot=full`

  if (query.hasOwnProperty('movieTitle')) return `${requestUri}&t=${query.movieTitle}`

  throw new Error('movie-find content source requires a movieTitle')
}

export default {
  resolve,
  schemaName: 'movie',
  params: {
    movieTitle: 'text'
  }
}
```

> **Restrictions**
>
> Environment values will only be accessible during server execution, not in the client, as they will be exposed to users. To ensure this, `fusion:environment` will return an empty object in the client.

-----

## "Secret" Encryption

Oftentimes you will find it necessary to use "secret" environment variables, such as API credentials, when building a Feature Pack. In local development, it's fine to simply add these unencrypted credentials to your `.env` file and use them. However, Fusion needs a way to access these "secret" variables in production environments without developers adding unencrypted credentials directly to their bundles.

To solve this problem, Fusion allows developers to include "secret" variables that have been encrypted with the proper KMS key to their environment variables, provided that these variables are surrounded by "percent-braces" characters (e.g. `%{MY_ENCRYPTED_TEXT_HERE}`). The encrypted values will then be decrypted at deploy-time and available to your bundle, without being committed into version control.

Information on how to properly encrypt environment variables is forthcoming.

<!-- TODO: instructions for encrypting env vars -->
