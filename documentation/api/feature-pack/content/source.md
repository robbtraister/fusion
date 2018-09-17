# Content Source API

## Implementation

##### Naming

A Content Source is expected to be stored and named in the following format:

- `/src/content/*.(js|json)`

> This will build a Content Source whose name is represented by the `*` portion of the filepath.

##### Example

```jsx
/*  /src/content/my-content-source.js  */

```

-----

## JavaScript Definition

A Content Source defined in JavaScript should return an object with the following properties:

- `resolve(key)` *Function*
- `params` *Object*
- [`schemaName`] *String*
- [`transform(json)`] *Function*


---

## JSON Definition


### `resolve` - *Function*

##### Description

Include the reference links for the appropriate page/template and/or output-type. Will insert a link reference tag. In the case of page/template, the file name will be content hashed to the specific state of the page or template.

##### Arguments

##### Example

-----

### `schema` - *String*

##### Description

Include the reference links for the appropriate page/template and/or output-type. Will insert a link reference tag. In the case of page/template, the file name will be content hashed to the specific state of the page or template.

##### Example

-----
