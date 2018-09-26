# Custom Fields

Custom Fields are implemented using React's [PropTypes](https://github.com/facebook/prop-types) library. They are available on both [Feature](./feature.md) and [Chain](./chain.md) type components. Fusion will read from your component's `propTypes` to find a `customFields` key whose value is `PropTypes.shape()`, since `customFields` are passed inside an object. Within the `PropTypes.shape()`, Fusion expects an object whose keys are the names of the custom fields you are enumerating, and the values being their `PropTypes`.

## Types

### `bool`

##### Description
Will produce a checkbox input in PageBuilder and return `true` or `false` depending on the selection. 

##### Example

```jsx
import PropTypes from 'prop-types';
import React from 'react'

const MyComponent = (props) => {
  const { showDesc } = props.customFields

  return (
    <h1>Hello World!</h1>
    {showDesc && (<p>Lorem ipsum</p>)}
  )
}

MyComponent.propTypes = {
  customFields: PropTypes.shape({
    myBool: PropTypes.bool
  })
}

export default MyComponent
```

-----

### `contentConfig()`

##### Description
Specifies the content schema that this component is compatible with, so that a PageBuilder user can select from a dynamic list of content sources that match that schema. Once they've selected the content source to use, PageBuilder also allows the user to set the parameters to use to query that content source. The content source name is returned to the component as `contentService`, and the parameters to query the content source are returned as an object on the key `contentConfigValues`.

##### Parameters

`contentConfig(schemaName)`
- `schemaName` (*String*): Represents the name of a [content schema](../content/schema.md)/shape defined in the bundle that this component is compatible with.

##### Example

```jsx
import PropTypes from 'prop-types'
import Consumer from 'fusion:consumer'
import React, { Component } from 'react'

@Consumer
class Songs extends Component {
  constructor(props) {
    super(props)

    const { songListConfig } = this.props.customFields

    const { contentService, contentConfigValues } = songListConfig

    this.fetchContent({
      songList: {
        source: contentService,
        key: contentConfigValues,
        query: '{ results { name } }'
      }
    })
  }

  render() {
    <ul>
      {this.state.songList.map(song => 
        <li>{song.name}</li>
      )}
    </ul>
  }
}

Songs.propTypes = {
  customFields: PropTypes.shape({
    songListConfig: PropTypes.contentConfig('songSchema')
  })
}

export default Songs
```
-----

### `number`

##### Description
Will produce a `number` input field in PageBuilder that allows users to enter a number value, which then gets returned to the component.

##### Example

```jsx
import PropTypes from 'prop-types';
import React from 'react'

const MyComponent = (props) => {
  const { description } = props.globalContent
  const { maxChars } = props.customFields

  const slicedContent = description.slice(0, maxChars)

  return (
    <p>{slicedContent}</p>
  )
}

MyComponent.propTypes = {
  customFields: PropTypes.shape({
    maxChars: PropTypes.number
  })
}

export default MyComponent
```

-----

### `oneOf`

##### Description
Will produce a `select` input in PageBuilder that allows users to select from one of the enumerated options in the array. Values in the array can be matched to human-readable text via the `labels` property passed to the [`tag`](#tag) method.

##### Example

```jsx
import PropTypes from 'prop-types';
import React from 'react'

const MyComponent = (props) => {
  const { listType } = props.customFields
  const El = (listType === 'ol') ? 'ol' : 'ul'
  return (
    <El>
      <li>Foo</li>
      <li>Bar</li>
      <li>Baz</li>
    </El>
  )
}

MyComponent.propTypes = {
  customFields: PropTypes.shape({
    listType: PropTypes.oneOf([
      'ol', 'ul'
    ]).tag({
      labels: {
        ol: 'Ordered List',
        ul: 'Unordered List'
      }
    })
  })
}

export default MyComponent
```

-----

### `string`

##### Description
Will produce a `text` input in PageBuilder that allows users to type a string value, which then gets returned to the component.

##### Example

```jsx
import PropTypes from 'prop-types';
import React from 'react'

const MyComponent = (props) => {
  const { headline } props.customFields

  return (<h1>{headline}</h1>)
}

MyComponent.propTypes = {
  customFields: PropTypes.shape({
    headline: PropTypes.string
  })
}

export default MyComponent
```

-----

## Global Options
These options are available as properties/methods that can be added to any Fusion PropType.

### `isRequired`

##### Description
Denotes that a certain prop is required. Will throw warnings in development if the chosen prop is not present.

##### Example

```jsx
...

MyComponent.propTypes = {
  customFields: PropTypes.shape({
    headline: PropTypes.string.isRequired
  })
}

export default MyComponent
```

### `tag()`

##### Description
The `tag()` method provides a way of adding additional metadata that PageBuilder requires about a custom field. It takes an object containing this metadata in key/value pair form as an argument.

##### Parameters

`tag(optionMap)`
- `optionMap` (*Object*): A map of metadata options about this particular custom field.
  - `optionMap.defaultValue` (*?*): The default value this custom field should take.
  - `optionMap.description` (*String*): A text description about the purpose of this custom field for users to better understand it.
  - `optionMap.group` (*String*): The name of a group of common custom fields. PageBuilder will aggregate custom fields with the same `group` name into a common UI interface element.
  - `optionMap.formPlugin` (*String*): The name of a plugin used by this custom field. More info on plugins in Fusion forthcoming.
  - `optionMap.format` (*String*): An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) compliant date format string, for datepicker custom fields. More info forthcoming.
  - `optionMap.hidden` (*Boolean*): Whether to show or hide the custom field.
  - `optionMap.labels` (*Object*): An object mapping a value listed in the array of a `oneOf` custom field to a more human-readable string
  - `optionMap.max` (*Number*): Maximum number allowed for a `number` type custom field.
  - `optionMap.min` (*Number*): Minimum number allowed for a `number` type custom field.
  - `optionMap.name` (*String*): A string representing a more human-friendly name of the custom field.
  - `optionMap.step` (*Number*): Interval to increase or decrease by for every change to a `number` type custom field.

##### Example

```jsx
...

MyComponent.propTypes = {
  customFields: PropTypes.shape({
    myNumberField: PropTypes.number.tag({
      name: 'My Number Field',
      group: 'examples',
      hidden: false,
      max: 100,
      min: 0,
      step: 5
    }),
    mySelectField: PropTypes.oneOf([
      'foo', 'bar', 'baz'
    ]).tag({
      defaultValue: 'bar',
      description: 'This custom field is useless',
      group: 'examples',
      labels: { foo: 'Foo', bar: 'Bar', baz: 'Baz' }
    })
  })
}

export default MyComponent
```
