'use strict'

const React = require('react')

const Content = require('fusion:content')

require('./style.scss')
require('./style2.scss')

const filter = `
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

const StoryItem = (story) => {
  const promoItems = story.promo_items && story.promo_items.basic
  return <React.Fragment>
    {
      (promoItems && promoItems.url && promoItems.type === 'image') &&
        <img src={promoItems.url} />
    }
    <div>{story.headlines && story.headlines.basic}</div>
    <div className={`blurb ${story.blurbStyle || ''}`} data-pb-field='description.basic' data-pb-field-type='text' data-pb-placeholder='Write blurb here.'>{(story.subheadlines && story.subheadlines.basic) || (story.description && story.description.basic)}</div>
  </React.Fragment>
}

const Story = ({ contentConfig }) =>
  <Content filter={filter} {...contentConfig}>
    {StoryItem}
  </Content>

module.exports = Story
