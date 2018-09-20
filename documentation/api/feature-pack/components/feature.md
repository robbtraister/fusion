# Feature API

## Implementation

##### Naming

A Feature is expected to be stored and named in one of the following formats:

- `/src/components/features/{featureGroup}/{featureName}.(js|jsx)`

> This will build one version of this component that is rendered for all Output Types, where the `{featureCategory}` portion of the filepath represents a namespace of related Features, and `{featureName}` represents the name of this Feature.

- `/src/components/features/{featureGroup}/{featureName}/{outputTypeName}.(js|jsx)`

> This will build a version of this component that corresponds to the name of the Output Type in the `{outputTypeName}` portion of the filename. The `{featureCategory}` portion of the filepath represents a namespace of related Features, and `{featureName}` represents the name of this Feature. If there is a component named `default.(js|jsx)`, that component will be rendered as a fallback if no file with the name of the relevant Output Type is found.

##### Example

```jsx
/*  /src/components/features/my-feature.jsx  */

```

-----

## Custom Fields

Custom Fields are implemented using React's [PropTypes](https://github.com/facebook/prop-types) library.
