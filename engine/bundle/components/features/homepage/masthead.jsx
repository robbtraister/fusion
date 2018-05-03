'use strict'

const React = require('react')

const Consumer = require('consumer')

const ImageFormat = require('../../tags/arc/image-format.jsx')

const fullDate = () => {
  const now = new Date()
  const monthName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ][now.getMonth()]
  return `${now.getDate()} ${monthName} ${now.getFullYear()}`
}

const Masthead = (props) => {
  const numberOfEditions = props.customFields.numberOfEditions || 0
  // const orderOfEditions = props.orderOfEditions || false

  const navOnTop = false
  const showDate = props.customFields.showDate || false
  const socialPosition = props.customFields.socialPosition || 'socialRight'
  const includeWeather = props.customFields.includeWeather || false
  const sticky = props.customFields.sticky
  const isBelowNav = props.customFields.isBelowNav

  const mastheadSize = props.customFields.mastheadSize || 'large'

  const borderBottomStyle = props.customFields.borderBottomStyle
  const borderBottomWidth = props.customFields.borderBottomWidth

  const weatherService = props.customFields.weatherService
  // const weatherServiceUsable = weatherService.toLowerCase()
  // const weatherDefaultLocation = props.customFields.weatherDefaultLocation

  const secondaryImage = props.customFields.secondaryImage
  const secondaryImageURL = props.customFields.secondaryImageURL

  const wrapperClasses = `mastnav ${sticky ? 'sticky' : 'free-float'} ${mastheadSize}`

  const logoSize = {
    large: 200,
    medium: 150,
    small: 100
  }[props.customFields.mastheadSize]

  return <div id={props.id} className={`masthead-row-wrapper${showDate ? ' min-height-158' : ''}${navOnTop ? ' lower-masthead' : ' upper-masthead'} ${mastheadSize}`}>
    <div className='masthead-wrapper pb-f-homepage-masthead'>
      <div id='mastnav-wrapper' className={wrapperClasses} data-nav-position={`${isBelowNav ? 'nav-above' : 'nav-below'}`}>
        <div id='mastnav-container'>
          <div className={`masthead headerbox border-bottom-${borderBottomStyle} border-bottom-${borderBottomWidth}`}>
            <div className='home-masthead-image'>

              <div className='organization-logo'>
                <a href={props.customFields.mastLogoUrl} className='logo' title={props.customFields.siteTitle}>
                  {(props.customFields.mastLogo)
                    ? (
                      (props.customFields.mastLogo.test(/.svg$/))
                        ? <img className='wplogo' src={props.customFields.mastLogo} alt={props.customFields.siteTitle} height={logoSize} />
                        : <React.Fragment>
                          <ImageFormat src={props.customFields.mastLogo} className='wplogo' alt={props.customFields.siteTitle} height={logoSize} />
                        </React.Fragment>
                    )
                    : <img className='orgLogo' src={`${props.contextPath}/resources/img/thenews.png`} alt={props.customFields.siteTitle} height={logoSize} />
                  }
                </a>
              </div>

              <div className='text'>
                <div className='details-container'>
                  {(showDate)
                    ? <div className='date'>
                      <div className='full-date'>
                        {fullDate()}
                      </div>
                    </div>
                    : null
                  }
                  {(numberOfEditions > 0)
                    ? <div className='editions'>
                      {/* <jsp:include page='../../utilities/custom-links/feature.jsp'>
                        <jsp:param name='numLinks' value='${numberOfEditions}' />
                        <jsp:param name='linkOrder' value='${orderOfEditions}' />
                        <jsp:param name='linkItemClasses' value='tiny mb0' />
                        <jsp:param name='linkStyle' value='edition-default' />
                      </jsp:include> */}
                    </div>
                    : null
                  }
                </div>
              </div>

              {(includeWeather)
                ? <React.Fragment>
                  {(weatherService === 'openweathermap')
                    ? <div /> // <pb:fetch-content var='altContent' service={weatherServiceUsable}>{{latitude: props.customFields.weatherLatitude, longitude: props.customFields.weatherLongitude, units: props.customFields.degreeUnits}}</pb:fetch-content>
                    : (weatherService === 'darksky')
                      ? <div /> // <pb:fetch-content var='altContent' service={weatherServiceUsable}>{{latitudeAndLongitude: `${props.customFields.weatherLatitude},${props.customFields.weatherLongitude}`, units:''}}</pb:fetch-content>
                      : null
                  }
                  <div className='weatherInfo'>
                    {/* <pb:inc-feature
                      name='utilities/weather'
                      content='${altContent}'
                      pb:weatherDefaultLocation='${custom.weatherDefaultLocation}'
                      wrap='true'
                      /> */}
                  </div>
                </React.Fragment>
                : null
              }

              {(socialPosition === 'socialHidden')
                ? null
                : <div className={`social-wrapper ${socialPosition}`}>
                  {/* <jsp:include page='../../utilities/custom-links/feature.jsp'>
                    <jsp:param name='numLinks' value='4' />
                    <jsp:param name='linkOrder' value='1,2,3,4' />
                    <jsp:param name='linkStyle' value='social-share-bar' />
                    <jsp:param name='facebook' value='true' />
                    <jsp:param name='print' value='true' />
                  </jsp:include> */}
                </div>
              }
            </div>

            {(secondaryImage)
              ? <a href={secondaryImageURL} className='logo secondary-logo' title={props.customFields.siteTitle} >
                <ImageFormat src={secondaryImage} className='wplogo' alt={props.customFields.siteTitle} height='65' width='90' />
              </a>
              : null
            }
          </div>
        </div>
      </div>
    </div>
  </div>
}

module.exports = Consumer(Masthead)
