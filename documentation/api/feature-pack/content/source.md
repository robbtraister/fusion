# Content Source API

## Implementation

##### Naming

A Content Source is expected to be stored and named in the following format:

- `/src/content/sources/{sourceName}.(js|json)`

> This will build a content source whose name is represented by the `{sourceName}` portion of the filepath.

##### Example

### JavaScript Definition

A Content Source defined in JavaScript should return an object with the following properties:

- `resolve(key)` (*Function*): A function that, given an object of data values to perform a query with, returns a URI to fetch content from that will return JSON.
- `params` (*Object*): A map of key/value pairs whose keys are the names of parameters to be used in the `key` object passed to the `resolve` method when invoked, and whose values are the "type" of data that parameter can hold. The available "types" are `text`, `number`, and `site`.
- [`schemaName`] (*String*): The name of a content schema (without the file extension) defined in the `/src/content/schemas/` directory that this content source corresponds to.
- [`transform(json)`] (*Function*): A function that, given the JSON returned from the endpoint defined in the `resolve` function, returns a version of that JSON with some transformation applied to it.

```jsx
/*  /src/content/sources/content-api.js  */

const resolve = function resolve (key) {
  const requestUri = `/content/v3/stories/?canonical_url=${key.canonical_url || key.uri}`

  return (key.hasOwnProperty('published'))
    ? `${requestUri}&published=${key.published}`
    : requestUri
}

module.exports = {
  resolve,
  schemaName: 'minimal',
  params: {
    canonical_url: 'text',
    published: 'text'
  }
}
```

-----

### JSON Definition

It's also possible to define a content source in JSON. This use case is mostly to support legacy content configurations that are being ported over in JSON format. Is possible, we recommend that you define your content sources using the JavaScript Definition syntax above, if only so that we can keep credentials that should be encrypted out of the Feature Pack bundle.

A Content Source defined in JSON should have the following properties:

- `id` (*String*): The name of the content source being defined.
- `content` (*String*): The name of the content schema that this content source is using. Treat this like the `schemaName` property in the JS definition.
- `params` (*Array[Object]*): An array of objects containing configuration data for each parameter included in this content source. Each object should contain the following properties:
  - `name` (*String*): The name of the param to be used in the `pattern` section.
  - `displayName` (*String*): A human readable title for the param to be used in PageBuilder.
  - `type` (*String*): The "type" of the param. Available options are `text`, `number`, and `site.` 
  - [`default`] (*String*): The default value this parameter should contain if it is not available at runtime.
- `pattern` (*String*): A URI string that is able to interpolate data enumerated by the `params` property with curly braces to contruct the full URL that represents this content source.


```json
{
  "id": "darksky",
  "content": "weather",
  "params": [
    {
      "name": "lat",
      "displayName": "Latitude",
      "type": "number",
      "default": "38.88",
    },
    {
      "name": "lon",
      "displayName": "Longitude",
      "type": "number",
      "default": "-77.00",
    },
  ],
  "pattern": "https://api.darksky.net/forecast/SOME_UNENCRYPTED_API_KEY/{lat},{lon}"
}
```

-----
