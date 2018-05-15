'use strict'

import React from 'react'

import Consumer from 'consumer'

const BreakingAlertV2 = (props) => {
  const parentPage = (props.customFields.autoLink || '').split(',')[1]
  const parentFeatureName = (props.customFields.autoLink || '').split(',')[0]

  const validFeature = parentPage !== 'no-value' && parentFeatureName !== 'no-value'
  const linkEditableAttributes = {
    'data-pb-url-field': props.customFields.barLink
  }
  const contentEditableAttributes = {
    'data-pb-field': props.customFields.barText,
    'data-pb-placeholder': 'Default Title',
    'data-pb-field-type': 'text'
  }

  return <div id='event-alert' className={`bar-wrapper ${props.isAdmin ? '' : 'hidden'}`}
    data-href={`${props.contextPath}/api/v2/render/feature?name=${parentFeatureName}&uri=${parentPage}`}
    data-has-news={!!props.customFields.barText}
    data-reload={validFeature && !props.isAdmin}
    style={{backgroundColor: props.customFields.backgroundColor, color: props.customFields.textColor}}
  >
    <div className='render-wrapper rendered-alert'>
      <div className='bar-text'>
        {(props.isAdmin || props.customFields.barText) &&
          (props.customFields.barLink
            ? <a className='event-item' href={props.barLink} {...linkEditableAttributes} {...contentEditableAttributes}>{props.customFields.barText}</a>
            : <div className='event-item' {...contentEditableAttributes}>{props.customFields.barText}</div>
          )
        }
      </div>
    </div>
    <div className='bar-close'>
      <i className='fa fa-close bar-close-btn' />
    </div>
  </div>
}

export default Consumer(BreakingAlertV2)
