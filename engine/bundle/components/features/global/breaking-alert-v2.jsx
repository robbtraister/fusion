'use strict'

const React = require('react')

const BreakingAlertV2 = (props) => {
  const parentPage = (props.autoLink || '').split(',')[1]
  const parentFeatureName = (props.autoLink || '').split(',')[0]

  const validFeature = parentPage !== 'no-value' && parentFeatureName !== 'no-value'
  const linkEditableAttributes = {
    'data-pb-url-field': props.barLink
  }
  const contentEditableAttributes = {
    'data-pb-field': props.barText,
    'data-pb-placeholder': 'Default Title',
    'data-pb-field-type': 'text'
  }

  return <div id='event-alert' className={`bar-wrapper ${props.isAdmin ? '' : 'hidden'}`}
    data-href={`/pb/api/v2/render/feature?name=${parentFeatureName}&uri=${parentPage}`}
    data-has-news={!!props.barText}
    data-reload={validFeature && !props.isAdmin}
    style={{backgroundColor: props.backgroundColor, color: props.textColor}}
  >
    <div className='render-wrapper rendered-alert'>
      <div className='bar-text'>
        {(props.isAdmin || props.barText) &&
          (props.barLink
            ? <a className='event-item' href={props.barLink} {...linkEditableAttributes} {...contentEditableAttributes}>{props.barText}</a>
            : <div className='event-item' {...contentEditableAttributes}>{props.barText}</div>
          )
        }
      </div>
    </div>
    <div className='bar-close'>
      <i className='fa fa-close bar-close-btn' />
    </div>
  </div>
}

module.exports = BreakingAlertV2
