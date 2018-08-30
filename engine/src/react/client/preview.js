'use strict'

/* global __CONTEXT_PATH__ */

const vMatch = /(\?|&)v=([^&]*)/.exec(window.location.search)
const v = vMatch ? vMatch[2] : ''

class Preview {
  constructor (iframe) {
    this.iframe = iframe

    this.isRenderReady = false
    this.latestOutputType = undefined
    this.latestRendering = undefined

    this.iframe.onload = () => this.appendAdminScript(this.CSR.bind(this))
    this.appendAdminScript(this.SSR.bind(this))
  }

  CSR () {
    if (this.latestRendering) {
      this.iframe.contentWindow.CSR(this.latestRendering)
    }
    this.isRenderReady = true
  }

  SSR () {
    if (this.latestRendering) {
      this.isRenderReady = false
      this.iframe.contentWindow.SSR(this.latestRendering, this.latestOutputType)
    } else {
      this.isRenderReady = true
    }
  }

  appendAdminScript (cb) {
    const script = this.iframe.contentDocument.createElement('script')
    script.type = 'application/javascript'
    script.src = `${__CONTEXT_PATH__}/dist/engine/admin.js?v=${v}`
    script.onload = cb
    this.iframe.contentDocument.body.appendChild(script)
  }

  render (renderingTree, outputType) {
    var isSameOutputType = (this.latestOutputType && (this.latestOutputType === outputType))

    this.latestOutputType = outputType
    this.latestRendering = renderingTree

    if (this.isRenderReady) {
      if (isSameOutputType) {
        this.CSR()
      } else {
        this.SSR()
      }
    }
  }
}

const attributeKey = 'data-admin-preview'
const previewCache = {}
window.renderPreview = function renderPreview (iframe, renderingTree, outputType) {
  const key = iframe.attributes[attributeKey] = iframe.attributes[attributeKey] || Date.now()
  const preview = previewCache[key] = previewCache[key] || new Preview(iframe)
  preview.render(renderingTree, outputType)
}

window.Preview = Preview
