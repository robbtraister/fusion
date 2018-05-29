'use strict'

const React = require('react')

const modalContent = `
path:
<pre className='path'>No path. Try refreshing the page.</pre>
slot is empty:
<pre className='empty'>True</pre>
response:
<pre className='response'>No response. Try refreshing the page.</pre>
`

const Dfp = (props) => {
  // Metas
  const dfpMetaPath = 'dfp_path'
  const dfpPageType = 'dfpPageType'
  // End Metas

  const borderBottomStyle = props.customFields.borderBottomStyle
  const mobile = props.customFields.mobileDisplay
  const desktop = props.customFields.desktopDisplay
  const positionName = props.customFields.positionName
  const dfpCode = props.customFields.dfp

  const slotTypeArray = (props.customFields.dimensions || '').split('-')
  const dimensions = slotTypeArray[0]
  const slotType = slotTypeArray[1] || null

  const globalDfpSection = null // props.globalContent.taxonomy.sites[0].additional_properties.original.DFP.dfp_path

  const dfpSection = globalDfpSection || dfpMetaPath

  const parsedSlotName = positionName.replace('_', '-')
  const fullAdSlot = (dfpPageType === 'tag')
    ? `/${dfpCode}/${dfpSection}/${positionName}`
    : `/${dfpCode}/${dfpSection}/${dfpPageType}/${positionName}`

  const [width, height] = dimensions.split('X')

  const parsedDimensions = (width === 300 && height === 250)
    ? [[300, 250], [300, 600]]
    : (width === 940 && height === 80)
      ? [[940, 80], [320, 50], [1, 1]]
      : (width === 800 && height === 600)
        ? [[800, 600], [300, 416]]
        : [width, height]

  const showAds = props.customFields.no_ads !== 'true'

  const rand = Math.round(Math.random() * 200)
  const debugSlotName = parsedSlotName || rand
  const hasErrors = !dfpSection || !dfpPageType || !dfpCode || !positionName
  const hasWarnings = hasErrors || !mobile || !desktop

  const Warnings = [
    [!parsedSlotName, 'Slot name is blank.'],
    [!positionName, 'Position name is blank.'],
    [!dfpCode, 'Please set a dfp client id in runtime properties with namespace: system.properties and key: dfp.'],
    [!mobile, 'This ad will be hidden on mobile.'],
    [!desktop, 'This ad will be hidden on desktop.']
  ]

  return <React.Fragment>
    {(props.isAdmin)
      ? <div className={`pb-ad-container ${slotType} ad-${dimensions} pb-ad-admin`}>
        <div id={debugSlotName}
          className='pb-ad hidden'
          data-slot-name={parsedSlotName}
          data-mobile-display='true'
          data-desktop-display='true'
        />
        {width}x{height}
        {(hasWarnings)
          ? <div className='ad-validation'>
            <ul className='fa-ul'>
              {Warnings
                .filter(warning => warning[0])
                .map((warning, i) => <li key={i} className='text-danger'>
                  <i className='fa fa-exclamation-triangle' aria-hidden='true' />
                  {warning[1]}
                </li>)
              }
            </ul>
          </div>
          : null
        }
        <button className={`btn btn-sm debug-btn ${hasErrors ? 'btn-danger' : 'btn-info'}`} data-content={modalContent} data-toggle='modal' data-target='#modal'>Show {hasErrors ? 'Errors' : 'Debug Info'}</button>
      </div>
      : (showAds && parsedSlotName)
        ? <div id={parsedSlotName}
          className={`pb-ad-container pb-ad pb-ad-prod ${slotType} ad-${dimensions}${mobile ? '' : ' hide-mobile'}${desktop ? '' : ' hide-desktop'}`}
          data-slot-name={parsedSlotName}
          data-mobile-display={mobile}
          data-desktop-display={desktop}
        />
        : null
    }
    {(showAds)
      ? <React.Fragment>
        <div className={`border-bottom-${borderBottomStyle}${mobile ? '' : ' hide-mobile'}${desktop ? '' : ' hide-desktop'}`} />
        <script type='text/javascript'>
          {(props.isAdmin) &&
            `$('.pb-f-ads-dfp').css('display', 'flex');`
          }
          window.dfpAdHelper.appendAd('{debugSlotName}', '{fullAdSlot}', {parsedDimensions}, '{slotType}');
          {(props.isAdmin) &&
            `window.googletag.cmd.push(function() {
              googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                if (event.slot.getSlotElementId() === '${debugSlotName}') {
                  var responseInfo = JSON.stringify(event.slot.getResponseInformation(), null, 1);
                  var path = event.slot.getAdUnitPath();
                  var empty = event.isEmpty;
                  var adEl = $('#${debugSlotName}');
                  var parent = adEl.parent();
                  adEl.hide();
                  var btn = $(parent).find('.debug-btn');
                  $(btn).data('path', path);
                  $(btn).data('response', responseInfo);
                  $(btn).data('empty', empty);
                }
              });
            });`
          }
        </script>
      </React.Fragment>
      : null
    }
  </React.Fragment>
}

module.exports = Dfp
