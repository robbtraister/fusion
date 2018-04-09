# Fusion Components

In Fusion, the features of a page are build/defined as React components.

Components will receive the information needed to render themselves via input props. The following props are passed to each component:

## Properties

-   id

The unique id of the chain/feature (e.g., "fesoQ718KG4rNq")

-   type

The type of the chain/feature (e.g., "homepage/story")

-   customFields

A map of all custom fields defined for this component

-   contentConfig

An object defining the content source as configured in the PageBuilder Admin. Takes the following shape:

```json
{
  "contentService": "content-api",
  "contentConfigValues": {
    ...
  }
}
```

Can be used with Fusion content fetching as:

```js
@Consumer
class Story extends React.Component {
  constructor (props) {
    super(props)

    if (props.contentConfig && props.contentConfig.contentService && props.contentConfig.contentConfigValues) {
      this.setContent({
        story: this.getContent(props.contentConfig.contentService, props.contentConfig.contentConfigValues, query)
      })
    } else {
      this.state = {story: null}
    }
  }

  render () {
    return (this.state && this.state.story)
      ? <StoryItem story={this.state.story} {...this.props} />
      : null
  }
}
```

For more on content fetching, see [here](./CONSUMER.md).
