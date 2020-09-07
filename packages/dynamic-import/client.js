require ("./moduleOverrides.js");

const { precacheDynamicModules } = require("./dynamic-versions");

// precaching happens automatically when appcache is used
// this behavior is backwards compatible
// on newer Browsers
function precacheOnLoad() {

  // Check inside onload to make sure Package.appcache has had a chance to
  // become available.
  if (!Package.appcache) {
    if(Meteor.isDevelopment) {
      console.log('dynamic-imports dynamic modules are not precached, because appcache package is not loaded');
    }
    return;
  }
  if(Meteor.isDevelopment) {
    console.log('dynamic-imports precaching dynamic modules, because of existing appcache package');
  }
  precacheDynamicModules();
}

// Use window.onload to only prefetch after the main bundle has loaded.
if (global.addEventListener) {
  global.addEventListener('load', precacheOnLoad, false);
} else if (global.attachEvent) {
  global.attachEvent('onload', precacheOnLoad);
}

exports.precacheDynamicModules = precacheDynamicModules;
exports.onPrecacheFinished = function(callback) {

}

exports.clearDynamicModulesCache = function() {

}