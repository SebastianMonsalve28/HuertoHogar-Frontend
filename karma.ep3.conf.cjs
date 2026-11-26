const base = require('./karma.conf.cjs');
module.exports = function(config) {
  base(config);
  config.set({
    files: ["tests/**/*.spec.jsx", {pattern:"public/**/*",included:false,served:true,watched:false}],
    proxies: {"/img/":"/base/public/img/", "/video/":"/base/public/video/"},
    preprocessors: { "tests/**/*.spec.jsx": ["webpack"] },
    reporters: ["progress", "coverage"],
    coverageReporter: {
      dir: "coverage/ep3",
      check: {global:{statements:90,branches:90,functions:90,lines:90}},
      reporters: [{type:"text-summary"},{type:"html",subdir:"html"},{type:"json-summary",subdir:".",file:"coverage-summary.json"},{type:"json",subdir:".",file:"coverage-final.json"}],
    },
  });
};
