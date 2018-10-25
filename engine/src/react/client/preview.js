'use strict'

/* global __CONTEXT_PATH__ */

const deployment = undefined
const deploymentParam = deployment ? `?v=${deployment}` : ''

function addElement (tag, type, attr, rel) {
  return function (doc, url, onload) {
    var e = doc.createElement(tag)
    e.type = type
    e.rel = rel
    e.onload = onload
    e[attr] = url
    doc.body.appendChild(e)
  }
}

const addJs = addElement('script', 'application/javascript', 'src')
const addCss = addElement('link', 'text/css', 'href', 'stylesheet')

class Preview {
  constructor (iframe) {
    this.iframe = iframe

    this.isReady = false
    this.outputType = undefined
    this.rendering = undefined
    this.website = undefined
    this.onReady = undefined
  }

  CSR () {
    this.iframe.contentWindow.Fusion = this.iframe.contentWindow.Fusion || {}
    this.iframe.contentWindow.Fusion.outputType = this.outputType
    this.iframe.contentWindow.render(this.rendering)
    this.onReady && this.onReady()
  }

  SSR () {
    this.isReady = false

    const form = this.iframe.contentDocument.createElement('form')
    form.method = 'POST'
    form.action = `${__CONTEXT_PATH__}/api/v3/render/?isAdmin=true${this.outputType ? `&outputType=${this.outputType}` : ''}${this.website ? `&_website=${this.website}` : ''}`
    form.style.visibility = 'hidden'

    var renderingInput = document.createElement('input')
    renderingInput.type = 'hidden'
    renderingInput.name = 'rendering'
    renderingInput.value = JSON.stringify(this.rendering)

    form.appendChild(renderingInput)
    this.iframe.contentDocument.body.appendChild(form)
    this.iframe.onload = () => {
      addJs(this.iframe.contentDocument, `${__CONTEXT_PATH__}/dist/engine/admin.js${deploymentParam}`, () => {
        // when loaded dynamically, serial loading is unreliable, so we have to manually load serially
        addJs(this.iframe.contentDocument, `${__CONTEXT_PATH__}/dist/components/combinations/${this.outputType}.js${deploymentParam}`, () => {
          this.isReady = true
          this.CSR()
        })
      })
      addCss(this.iframe.contentDocument, `${__CONTEXT_PATH__}/dist/components/output-types/${this.outputType}.css${deploymentParam}`)
      addCss(this.iframe.contentDocument, `${__CONTEXT_PATH__}/dist/components/combinations/${this.outputType}.css${deploymentParam}`)
    }

    form.submit()
  }

  reload (callback) {
    this.onReady = callback
    this.SSR()
  }

  render (rendering, outputType, website, callback) {
    this.rendering = rendering
    this.onReady = callback

    /* eslint-disable eqeqeq */
    if ((this.outputType != outputType) || (this.website != website)) {
      this.outputType = outputType
      this.website = website
      this.SSR()
    } else if (this.isReady) {
      this.CSR()
    }
    /* eslint-enable eqeqeq */
  }
}

const attributeKey = 'data-admin-preview'
const previewCache = {}
const getPreview = function getPreview (iframe) {
  const key = iframe.attributes[attributeKey] = iframe.attributes[attributeKey] || Date.now()
  const preview = previewCache[key] = previewCache[key] || new Preview(iframe)
  return preview
}
window.renderPreview = function renderPreview (iframe, rendering, outputType, website, onloadCallback) {
  getPreview(iframe).render(rendering, outputType, website, onloadCallback)
}
window.reloadPreview = function reloadPreview (iframe, onloadCallback) {
  getPreview(iframe).reload(onloadCallback)
}

window.Preview = Preview
