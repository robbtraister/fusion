'use strict'

require('../render')((Template, data) => {
  const app = document.getElementById('App')
  if (app) {
    app.innerHTML = Template(data)
  }
})
