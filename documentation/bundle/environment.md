# Environment

Environment variables can be configured within your repo so that they are provided to the server at runtime. This provides much more control to the developer than having to make requests to the PB team, who then has to manage all client environments in a single place.

## Secrets

Secrets are necessary to access restricted content. In order to provide secrets to the server, Fusion provides decryption and module import support.

1.  Encrypt your secrets using the appropriate KMS key for your client
1.  Create a file in your bundle called `src/environment.js`
1.  Enter the value in this file as ciphertext decorated in percent-braces, as `%{...}`
1.  Export the value as an object property
1.  In your content source (or whatever server-side code you need), import `fusion:environment` and use the object properties as necessary

_Note: you may also use `environment.json` if you do not need to execute any js code._


## Restrictions

Environment values will only be accessible during server execution, not in the client, as they will be exposed to users. To ensure this, `fusion:environment` will return an empty object in the client.


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

Alternatively:

`src/environment.json`
```
{
  "API_CREDENTIALS": "%{AWSENCRYPTEDCIPHERTEXT}"
}
```
