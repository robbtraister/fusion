'use strict'

/* global __CONTEXT_PATH__ */

const version = null // require('./version')()

class Preview {
  constructor (iframe) {
    this.iframe = iframe

    this.isRenderReady = false
    this.latestOutputType = undefined
    this.latestRendering = undefined
    this.initializeAdmin = undefined

    this.iframe.onload = () => this.appendAdminScript(this.CSR.bind(this))
    this.appendAdminScript(this.SSR.bind(this))
  }

  CSR () {
    if (this.latestRendering) {
      this.iframe.contentWindow.CSR(this.latestRendering)
      this.initializeAdmin()
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
    script.src = `${__CONTEXT_PATH__}/dist/engine/admin.js${version ? `?v=${version}` : ''}`
    script.onload = cb
    this.iframe.contentDocument.body.appendChild(script)

    // in case the output type doesn't include the Fusion script, ensure we have the outputType defined
    this.iframe.contentWindow.Fusion = this.iframe.contentWindow.Fusion || {}
    this.iframe.contentWindow.Fusion.outputType = this.latestOutputType
  }

  render (renderingTree, outputType, initializeAdmin) {
    var isSameOutputType = (this.latestOutputType && (this.latestOutputType === outputType))

    this.latestOutputType = outputType
    this.latestRendering = renderingTree
    this.initializeAdmin = initializeAdmin

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
window.renderPreview = function renderPreview (iframe, renderingTree, outputType, initializeAdmin) {
  const key = iframe.attributes[attributeKey] = iframe.attributes[attributeKey] || Date.now()
  const preview = previewCache[key] = previewCache[key] || new Preview(iframe)
  preview.render(renderingTree, outputType, initializeAdmin)
}

window.Preview = Preview
