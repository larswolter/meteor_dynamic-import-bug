Package.describe({
  name: "larswolter:dynamic-package",
  version: "0.1.0",
});

Package.onUse(function (api) {
  // Do not allow this package to be used in pre-Meteor 1.5 apps.
  api.use("ecmascript");

  api.mainModule("client.js", "client");
  api.mainModule("server.js", "server");
});
