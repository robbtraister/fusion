(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['temp.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div>\n  "
    + container.escapeExpression(((helper = (helper = helpers.abc || (depth0 != null ? depth0.abc : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"abc","hash":{},"data":data}) : helper)))
    + "\n</div>\n";
},"useData":true});
})();
