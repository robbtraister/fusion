'use strict'

/* global __CONTEXT_PATH__ */

const version = undefined
const versionParam = version ? `?v=${version}` : ''

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
    this.lastOutputType = undefined
    this.lastRendering = undefined
    this.onReady = undefined
  }

  CSR () {
    const frameWindow = this.iframe.contentWindow
    frameWindow.Fusion = frameWindow.Fusion || {}
    frameWindow.Fusion.outputType = this.lastOutputType
    frameWindow.render(this.lastRendering)
    this.onReady && this.onReady()
  }

  SSR () {
    this.isReady = false

    const frameDocument = this.iframe.contentDocument

    const form = frameDocument.createElement('form')
    form.method = 'POST'
    form.action = `${__CONTEXT_PATH__}/api/v3/render/?isAdmin=true&outputType=${this.lastOutputType}`
    form.style.visibility = 'hidden'

    var rendering = document.createElement('input')
    rendering.type = 'hidden'
    rendering.name = 'rendering'
    rendering.value = JSON.stringify(this.lastRendering)

    form.appendChild(rendering)
    frameDocument.body.appendChild(form)
    this.iframe.onload = () => {
      let loadedCount = 0
      const jsLoaded = () => {
        if (++loadedCount >= 2) {
          this.isReady = true
          this.CSR()
        }
      }
      addJs(frameDocument, `${__CONTEXT_PATH__}/dist/engine/admin.js${versionParam}`, jsLoaded)
      addJs(frameDocument, `${__CONTEXT_PATH__}/dist/components/combinations/${this.lastOutputType}.js${versionParam}`, jsLoaded)
      addCss(frameDocument, `${__CONTEXT_PATH__}/dist/components/output-types/${this.lastOutputType}.css${versionParam}`)
      addCss(frameDocument, `${__CONTEXT_PATH__}/dist/components/combinations/${this.lastOutputType}.css${versionParam}`)
    }

    form.submit()
  }

  render (renderingTree, outputType, callback) {
    this.lastRendering = renderingTree
    this.onReady = callback

    if (this.lastOutputType !== outputType) {
      this.lastOutputType = outputType
      this.SSR()
    } else if (this.isReady) {
      this.CSR()
    }
  }
}

const attributeKey = 'data-admin-preview'
const previewCache = {}
window.renderPreview = function renderPreview (iframe, renderingTree, outputType, onloadCallback) {
  const key = iframe.attributes[attributeKey] = iframe.attributes[attributeKey] || Date.now()
  const preview = previewCache[key] = previewCache[key] || new Preview(iframe)
  preview.render(renderingTree, outputType, onloadCallback)
}

window.Preview = Preview
