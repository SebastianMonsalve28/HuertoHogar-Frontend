const base = require("./karma.conf.cjs");
module.exports = function(config) {
  base(config);
  config.set({
    files: ["tests/**/*.spec.jsx"],
    preprocessors: { "tests/**/*.spec.jsx": ["webpack"] },
    reporters: ["progress", "coverage"],
    coverageReporter: {
      dir: "coverage/ep3",
      reporters: [ { type: "text-summary" }, { type: "html", subdir: "html" } ],
    },
  });
};
