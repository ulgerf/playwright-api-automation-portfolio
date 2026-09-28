const common = {
  requireModule: ["ts-node/register"],
  require: ["support/**/*.ts", "src/test/steps/**/*.ts"],
  paths: ["src/test/features/**/*.feature"],
  format: [
    "progress",
    "html:test-results/cucumber-report.html",
    "json:test-results/cucumber-report.json",
    "junit:test-results/cucumber-junit.xml"
  ],
  formatOptions: { snippetInterface: "async-await" }
};

module.exports = {
  default: common
};
