'use strict'

const React = require('react')

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
  const numberOfEditions = props.numberOfEditions || 0
  // const orderOfEditions = props.orderOfEditions || false

  const navOnTop = false
  const showDate = props.showDate || false
  const socialPosition = props.socialPosition || 'socialRight'
  const includeWeather = props.includeWeather || false
  const sticky = props.sticky
  const isBelowNav = props.isBelowNav

  const mastheadSize = props.mastheadSize || 'large'

  const borderBottomStyle = props.borderBottomStyle
  const borderBottomWidth = props.borderBottomWidth

  const weatherService = props.weatherService
  // const weatherServiceUsable = weatherService.toLowerCase()
  // const weatherDefaultLocation = props.weatherDefaultLocation

  const secondaryImage = props.secondaryImage
  const secondaryImageURL = props.secondaryImageURL

  const wrapperClasses = `mastnav ${sticky ? 'sticky' : 'free-float'} ${mastheadSize}`

  const logoSize = {
    large: 200,
    medium: 150,
    small: 100
  }[props.mastheadSize]

  return <div className={`masthead-row-wrapper${showDate ? ' min-height-158' : ''}${navOnTop ? ' lower-masthead' : ' upper-masthead'} ${mastheadSize}`}>
    <div className='masthead-wrapper pb-f-homepage-masthead'>
      <div id='mastnav-wrapper' className={wrapperClasses} data-nav-position={`${isBelowNav ? 'nav-above' : 'nav-below'}`}>
        <div id='mastnav-container'>
          <div className={`masthead headerbox border-bottom-${borderBottomStyle} border-bottom-${borderBottomWidth}`}>
            <div className='home-masthead-image'>

              <div className='organization-logo'>
                <a href={props.mastLogoUrl} className='logo' title={props.siteTitle}>
                  {(props.mastLogo)
                    ? (
                      (props.mastLogo.test(/.svg$/))
                        ? <img className='wplogo' src={props.mastLogo} alt={props.siteTitle} height={logoSize} />
                        : <React.Fragment>
                          <ImageFormat src={props.mastLogo} className='wplogo' alt={props.siteTitle} height={logoSize} />
                        </React.Fragment>
                    )
                    : <img className='orgLogo' src='/pb/resources/assets/img/thenews.png' alt={props.siteTitle} height={logoSize} />
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
                    ? <div /> // <pb:fetch-content var='altContent' service={weatherServiceUsable}>{{latitude: props.weatherLatitude, longitude: props.weatherLongitude, units: props.degreeUnits}}</pb:fetch-content>
                    : (weatherService === 'darksky')
                      ? <div /> // <pb:fetch-content var='altContent' service={weatherServiceUsable}>{{latitudeAndLongitude: `${props.weatherLatitude},${custom.weatherLongitude}`, units:''}}</pb:fetch-content>
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
              ? <a href={secondaryImageURL} className='logo secondary-logo' title={props.siteTitle} >
                <ImageFormat src={secondaryImage} className='wplogo' alt={props.siteTitle} height='65' width='90' />
              </a>
              : null
            }
          </div>
        </div>
      </div>
    </div>
  </div>
}

module.exports = Masthead
