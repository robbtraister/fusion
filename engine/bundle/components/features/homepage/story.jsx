'use strict'

const React = require('react')
const Consumer = require('consumer')

const query = `
  {
    description {
      basic
    }
    headlines {
      basic
    }
    promo_items {
      basic {
        type
        url
      }
    }
    subheadlines {
      basic
    }
  }
`

const StoryItem = (props) => {
  const promoItems = props.story.promo_items && props.story.promo_items.basic
  return <React.Fragment>
    {
      (promoItems && promoItems.url && promoItems.type === 'image') &&
        <img src={promoItems.url} />
    }
    <div>{props.story.headlines && props.story.headlines.basic}</div>
    <div className={`blurb ${props.story.blurbStyle || ''}`} data-pb-field='description.basic' data-pb-field-type='text' data-pb-placeholder='Write blurb here.'>{(props.story.subheadlines && props.story.subheadlines.basic) || (props.story.description && props.story.description.basic)}</div>
  </React.Fragment>
}

@Consumer
class Story extends React.Component {
  constructor (props, context) {
    super(props, context)

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

module.exports = Story
