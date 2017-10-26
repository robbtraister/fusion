'use strict'

window.notFound = () => {
  const noscript = document.getElementById('404')
  if (noscript) {
    const html = noscript.innerText
    const parent = noscript.parentElement
    parent.removeChild(noscript)
    parent.innerHTML += html
  }
}
