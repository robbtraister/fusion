'use strict'

/* global Fusion */

require('./shared')
Fusion.isAdmin = true

const React = window.react
const ReactDOM = window.ReactDOM

const getContext = require('./context')

const Quarantine = require('../components/quarantine')
const AdminLoader = require('../loaders/admin-loader')

const getTree = require('../../_shared/rendering-to-tree')

const ErrorDisplay = ({ error, footer, name }) =>
  React.createElement(
    'div',
    {
      style: {
        background: 'repeating-linear-gradient(-45deg, #fee, #fee 10px, #fff 10px, #fff 20px)',
        backgroundColor: '#fee',
        border: '2px dashed #e00',
        color: '#c00',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '20px',
        padding: '10px',
        textAlign: 'left'
      }
    },
    [
      React.createElement(
        'h2',
        {
          key: 'title',
          style: {
            textAlign: 'inherit',
            fontFamily: 'inherit',
            fontSize: '18px',
            fontWeight: '600',
            padding: '0px',
            margin: '0px'
          }
        },
        'Component Code Error'
      ),
      React.createElement(
        'p',
        {
          key: 'body',
          style: {
            textAlign: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontStyle: 'inherit',
            fontWeight: 'inherit',
            lineHeight: 'inherit',
            margin: '10px 0',
            padding: '0px'
          }
        },
        `An error occurred while rendering ${name}.`
      ),
      (error && error.message) || error,
      (footer)
        ? React.createElement(
          'div',
          {},
          footer
        )
        : null
    ]
  )

Fusion.components.Quarantine = Quarantine(ErrorDisplay)

function showLayoutError (layoutName, error) {
  const shade = document.createElement('div')
  shade.style.backgroundColor = 'rgba(0,0,0,0.5)'
  shade.style.bottom = '0'
  shade.style.left = '0'
  shade.style.position = 'fixed'
  shade.style.right = '0'
  shade.style.top = '0'
  shade.style.zIndex = '99999999'
  document.getElementById('fusion-app').appendChild(shade)

  ReactDOM.render(
    React.createElement(
      'div',
      {
        style: {
          left: '50%',
          maxWidth: '500px',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }
      },
      React.createElement(
        ErrorDisplay,
        {
          name: layoutName,
          error,
          footer: 'Please correct issue to continue editing'
        }
      )
    ),
    shade
  )
}

window.render = function render (rendering) {
  const fusionElement = window.document.getElementById('fusion-app')
  if (fusionElement) {
    const html = fusionElement.innerHTML

    try {
      const context = getContext(getTree({ rendering, outputType: Fusion.outputType }))

      Fusion.elementCache = {}
      const staticElements = window.document.getElementsByClassName('fusion:static')
      Array.prototype.slice.call(staticElements).forEach(elem => {
        Fusion.elementCache[elem.id] = elem.innerHTML
      })

      // don't catch this like in production
      ReactDOM.render(
        React.createElement(
          Fusion.context.Provider,
          {
            value: context
          },
          new AdminLoader().createElement(context.tree)
        ),
        fusionElement
      )
    } catch (error) {
      fusionElement.innerHTML = html
      showLayoutError(rendering.layout, error)

      throw error
    }
  }
}
