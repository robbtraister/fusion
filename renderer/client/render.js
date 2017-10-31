'use strict'

/* global content, Template */

let did404 = false
const notFound = window.notFound = () => {
  if (!did404) {
    const noscript = document.getElementById('404')
    if (noscript) {
      did404 = true
      const html = noscript.innerText
      const parent = noscript.parentElement
      parent.removeChild(noscript)
      parent.innerHTML += html
    }
  }
}

let didRender = false
module.exports = renderFn => {
  const render = () => {
    if (!didRender) {
      didRender = true

      if (typeof content === 'undefined' || typeof Template === 'undefined') {
        notFound()
      } else {
        const templateStyle = document.getElementById('template-style')
        if (Template.cssFile) {
          templateStyle.href = `/_assets/templates/${Template.cssFile}`
        }

        renderFn(Template, content)
      }
    }
  }

  document.addEventListener('DOMContentLoaded', render)
  document.body.onload = render
}
