# Feature API

## Implementation

##### Naming

A Feature is expected to be stored and named in one of the following formats:

- `/src/components/features/*.(js|jsx)`

> This will build one version of this component that is used by all Output Types, where the `*` portion of the filepath represents the name of the Feature.

- `/src/components/features/*/{outputTypeName}.(js|jsx)`

> This will build a version of this component that corresponds to the name of the Output Type in the filename. The `*` portion of the filepath represents the name of the Feature. If there is a `default.(js|jsx)` component, that component will be rendered as a fallback if no file with the same name of the relevant Output Type is found.

##### Example

```jsx
/*  /src/components/features/my-feature.jsx  */

```

-----

## Custom Fields

Custom Fields are implemented using React's [PropTypes](https://github.com/facebook/prop-types) library.
