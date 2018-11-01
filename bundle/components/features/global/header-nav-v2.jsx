'use strict'

const React = require('react')
const PropTypes = require('prop-types')

const Content = require('fusion:content')

const Search = require('../utilities/search.jsx')

const BurgerImage = (props) => {
  const hasMenuLabel = props.menuLabel.length > 0
  return <React.Fragment>
    {hasMenuLabel &&
      <span className='menu-label hidden-sm hidden-xs'>{props.menuLabel}</span>
    }
    <i className='fa fa-bars fa-2x' aria-hidden='true' role='button' />
  </React.Fragment>
}

const DropdownDrawer = (props) => {
  const menuLabel = (props.customFields.menuLabel || '').trim()
  const hasMenuLabel = menuLabel.length > 0

  return <div className='dropdown-navigation'>
    <ul>
      <li>
        <form action='https://example.com/subscribe' target='_blank'>
          <input type='checkbox' className='toggle' name='toggle-drawer' id='toggle-drawer' />
          <label className={`burger-label ${hasMenuLabel ? 'with-text' : ''}`} htmlFor='toggle-drawer'>
            <BurgerImage menuLabel={menuLabel} />
          </label>
          <ul className={`menu-guts ${props.customFields.pushContent === 'true' ? 'push-content' : ''}`}>
            {props.items && props.items
              .filter(item => item.site && item.site.site_url)
              .map((item, i) =>
                <li key={i} className='main-nav-tab'>
                  <div className='togglebox'>
                    <input type='checkbox' className='toggle' name={`toggle-${i}`} id={`toggle-${i}`} />
                    <div className='subnav-present'>
                      {(item.children && item.children.length > 0)
                        ? <label htmlFor={`toggle-${i}`} className='nav-menu-item nav-menu-item-with-children'>
                          <a href={item.site.site_url}>{item.name}</a>
                          <i className='fa fa-custom-content' aria-hidden='true' />
                        </label>
                        : <a href={item.site.site_url}>
                          <div className='nav-menu-item'>{item.name}</div>
                        </a>
                      }
                    </div>
                    {(item.children && item.children.length > 0)
                      ? <ul className='sub-nav'>
                        {item.children
                          .filter(subItem => subItem.site && subItem.site.site_url)
                          .map((subItem, i) =>
                            <li key={i}>
                              <a href={subItem.site.site_url}>
                                <div className='nav-menu-item'>{subItem.name}</div>
                              </a>
                            </li>
                          )}
                      </ul>
                      : null
                    }
                  </div>
                </li>
              )}
          </ul>
        </form>
      </li>
    </ul>
  </div>
}

const TopMenu = (props) => {
  const items = (props.items || [])
    .filter(item => item.site && item.site.siteUrl)

  return (props.customFields.logo)
    ? <img className='logo hidden-sm hidden-xs' src={props.customFields.logo} />
    : (props.items && props.items.length)
      ? <ul className='top-nav-list hidden-sm hidden-xs'>
        {items
          .map((item, i) =>
            <li className={`top-nav-list-item${i === 0 ? ' first' : ''}${i === (items.length - 1) ? ' last' : ''}`}>
              <a href={item.site.site_url}>{item.name}</a>
            </li>
          )}
      </ul>
      : null
}

const HeaderNavV2Impl = (props) =>
  <React.Fragment>
    <div className={`amp-feature-wrapper ${props.customFields.makeNavigationBarSticky ? 'min-height-45' : 'non-sticky-nav'}`}>
      <DropdownDrawer {...props} />
      <div className='center-nav'>
        <TopMenu {...props} />
      </div>
      <div className='search-box'>
        <Search />
      </div>
    </div>

    <div id='pushContent' data-run-function={props.customFields.pushContent} />

    {props.customFields.makeNavigationBarSticky && <div className='min-height-45' />}
  </React.Fragment>

const HeaderNavV2 = (props) =>
  <Content source='site-menu' contentConfigValues={{ id: '/' }} filter='{children{name,site{site_url},children{name,site{site_url}}}}'>
    {
      (content) => HeaderNavV2Impl({ items: (content && content.children) || [], ...props })
    }
  </Content>

HeaderNavV2.propTypes = {
  customFields: PropTypes.shape({
    logo: PropTypes.string.tag({ test: 'some value' }),
    makeNavigationBarSticky: PropTypes.bool,
    menuLabel: PropTypes.string,
    pushContent: PropTypes.bool
  })
}

module.exports = HeaderNavV2
