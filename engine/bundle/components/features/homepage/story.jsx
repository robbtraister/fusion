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
`.replace(/[ \t\n]+/g, ' ')

const StoryItem = (props) => {
  const promoItems = props.promo_items && props.promo_items.basic
  return <React.Fragment>
    {
      (promoItems && promoItems.url && promoItems.type === 'image') &&
        <img src={promoItems.url} />
    }
    <div>{props.headlines && props.headlines.basic}</div>
    <div className={`blurb ${props.blurbStyle || ''}`} data-pb-field='description.basic' data-pb-field-type='text' data-pb-placeholder='Write blurb here.'>{(props.subheadlines && props.subheadlines.basic) || (props.description && props.description.basic)}</div>
  </React.Fragment>
}

class Story extends Consumer {
  constructor (props, context) {
    super(props, context)

    if (props.contentService && props.contentConfigValues) {
      this.setContent({
        story: this.getContent(props.contentService, props.contentConfigValues, query)
      })
    } else {
      this.state = {story: null}
    }
  }

  render () {
    return (this.state.story)
      ? <StoryItem id={this.props.id} {...this.state.story} />
      : null
  }
}

module.exports = Story
