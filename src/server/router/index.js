'use strict'

const express = require('express')

const render = require('../render')
const resolve = require('../resolve')

function router (options) {
  const router = express.Router()

  router.use(require('./assets')(options))

  router.use('/embed', (req, res, next) => {
    const template = req.query.template;

    res.send(`
;(function(){
  window.Fusion = window.Fusion || {};
  if (!Fusion.runtimeLoaded) {
    Fusion.runtimeLoaded = true;
    document.write('<script src="/dist/runtime.js" defer="defer"><\\/script>');
    document.write('<script src="/dist/engine.js" defer="defer"><\\/script>');
  }
  document.write('<script src="/dist/templates/${template}/default.js" defer="defer"><\\/script>');
  var id = 'fusion-embed-' + Date.now() + '-' + Math.random().toString().replace(/\\./g, '');
  document.write('<div id="' + id + '"></div>');
  var context = {
    outputType: 'default',
    template: ${JSON.stringify(template)}
  };
  document.addEventListener('DOMContentLoaded', function(){
    Fusion && Fusion.render && Fusion.render(context, id);
  });
})();
`)
  })

  router.use(async (req, res, next) => {
    try {
      res.send(await render(await resolve(req.url)))
    } catch (err) {
      next(err)
    }
  })

  return router
}

module.exports = router
