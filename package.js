Package.describe({
  name: 'meteor-khan-oauth',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  request:"2.58.0",
  "oauth-1.0a":"0.2.1"
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use("iron:router@1.0.9");
  api.use("meteorhacks:npm");
  api.use("templating");
  api.addFiles(["meteor-khan-oauth.js"],["server"]);
  api.addFiles(["khanRequestUrl.html",
                "khanRequestUrl.js"], ["client"]);
  api.export("KhanOAuth", ["server"]);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('meteor-khan-oauth');
  api.addFiles(["meteor-khan-oauth.js"],["server"]);

});
