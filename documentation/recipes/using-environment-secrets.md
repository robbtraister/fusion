# Using Environment "Secrets" 

Environment variables are exactly what they sound like: variables that are set per environment. They are typically used for things like credentials or domains that may change from local to staging to production environments. In Fusion, environment variables are defined in a `.env` file for the local environment, and in the `/src/environments/` directory for other environments. 

## Runtime properties vs. environment variables
Runtime properties and environment variables serve similar purposes, so it can be easy to mix up which one you want to use in a given situation. But there are a few key distinctions between the two that can help determine which is the right tool for the job:
- Environment variables can be encrypted locally and decrypted on the server. For this reason, they are ideal for "secret" variables like API credentials that you don't want to be exposed in plain text in your code repository. Runtime properties do not have this capability.
- Runtime properties can be set on a "per-site" basis in multisite Fusion applications, meaning each site can have its own unique value for a given property. Environment variables, on the other hand, are universal across sites (not to be confused with environments).

## Local vs. production environments

As mentioned prev
## Encrypting secrets



Secrets are necessary to access restricted content. In order to provide secrets to the server, Fusion provides decryption and module import support.

1.  Encrypt your secrets using the appropriate KMS key for your client
2.  Create a file in your bundle called `src/environment.js`
3.  Enter the value in this file as ciphertext decorated in percent-braces, as `%{...}`
4.  Export the value as an object property
5.  In your content source (or whatever server-side code you need), import `fusion:environment` and use the object properties as necessary

_Note: you may also use `environment.json` if you do not need to execute any js code._


## Restrictions

Environment values will only be accessible during server execution, not in the client, as they will be exposed to users. To ensure this, `fusion:environment` will return an empty object in the client.


## Local Development

Encrypted values will only be decrypted at deployment, so they will be evaluated as-is in local development. To address this, local environment variables will take precedence over repo values. To provide the plaintext version of a secret on your local machine, simply define it in your .env file.


## Examples

`src/environment.js`
```
export default {
  API_CREDENTIALS: "%{AWSENCRYPTEDCIPHERTEXT}"
}
```

`src/content/sources/content-api.js`
```
import { API_CREDENTIALS } from 'fusion:environment'

export default {
  resolve (data) {
    return `https://${API_CREDENTIALS}@api.content.arc.pub/api/v1/?data=${data}`
  }
}
```

`.env`
```
API_CREDENTIALS=user:password
```

Alternatively:

`src/environment.json`
```
{
  "API_CREDENTIALS": "%{AWSENCRYPTEDCIPHERTEXT}"
}
```

 **Next: [Adding Styling to Components](./adding-styling.md)**
