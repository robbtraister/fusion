'use strict'

const Sparse = () => ''

Sparse.transforms = {
  embed (_, { template }) {
    return `
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
`
  }
}

export default Sparse
