# Secrets

Secrets are necessary to access restricted content. In order to provide secrets to the server, fusion provides decryption and module import support.

1.  Encrypt your secrets using the appropriate KMS key for your client
1.  Create a top-level file in your bundle called `environment.js`
1.  Enter the value in this file as ciphertext decorated in percent-brackets, as `%{...}`
1.  Export the value as an object property
1.  In your content source (or whatever server-side code you need), import `fusion:environment` and use the object properties as necessary

_Note: you may also use `environment.json` if you do not need to execute any js code._


## Restrictions

Secrets should only be accessible in server code, not client-side components as they will be exposed to users. To ensure this, `fusion:environment` will only be accessible to code when running on the server. If you attempt to import `fusion:environment` in client-side code, it will fail babel/webpack compilation.


## Examples

`./environment.js`
```
export default {
  API_CREDENTIALS: "%{AWSENCRYPTEDCIPHERTEXT}"
}
```

`./content/sources/content-api.js`
```
import { API_CREDENTIALS } from 'fusion:environment'

export default {
  resolve (data) {
    return `https://${API_CREDENTIALS}@api.content.arc.pub/api/v1/?data=${data}`
  }
}
```

Alternatively:

`./environment.json`
```
{
  "API_CREDENTIALS": "%{AWSENCRYPTEDCIPHERTEXT}"
}
```
