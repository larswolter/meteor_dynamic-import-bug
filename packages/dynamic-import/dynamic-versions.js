// This magic double-underscored identifier gets replaced in
// tools/isobuild/bundler.js with a tree of hashes of all dynamic
// modules, for use in client.js and cache.js.
var versions = __DYNAMIC_VERSIONS__;
console.log(versions);
exports.get = function (id) {
  var tree = versions;
  var version = null;

  id.split("/").some(function (part) {
    if (part) {
      // If the tree contains identifiers for Meteor packages with colons
      // in their names, the colons should not have been replaced by
      // underscores, but there's a bug that results in that behavior, so
      // for now it seems safest to be tolerant of underscores here.
      // https://github.com/meteor/meteor/pull/9103
      tree = tree[part] || tree[part.replace(":", "_")];
    }

    if (!tree) {
      // Terminate the search without reassigning version.
      return true;
    }

    if (typeof tree === "string") {
      version = tree;
      return true;
    }
  });

  return version;
};

function getFlatModuleArray(tree) {
  var parts = [""];
  var result = [];

  function walk(t) {
    if (t && typeof t === "object") {
      Object.keys(t).forEach(function (key) {
        parts.push(key);
        walk(t[key]);
        parts.pop();
      });
    } else if (typeof t === "string") {
      result.push(parts.join("/"));
    }
  }

  walk(tree);

  return result;
}

// If Package.appcache is loaded, preload additional modules after the
// core bundle has been loaded.
exports.precacheDynamicModules = function precacheDynamicModules(event) {
  // Prefetch in chunks to reduce overhead. If we call module.prefetch(id)
  // multiple times in the same tick of the event loop, all those modules
  // will be fetched in one HTTP POST request.
  function prefetchInChunks(modules, amount) {
    Promise.all(modules.splice(0, amount).map(function (id) {
      return new Promise(function(resolve, reject) {
        module.prefetch(id).then((module)=>resolve(module)).catch((err)=>{
          // we probably have a : _ mismatch
          // what can get wrong if we do the replacement
          // 1. a package with a name like a_b:package will not resolve
          // 2. someone falsely imports a_package that does not exist but a package
          //    a:package exists, so this one gets imported and its usage will fail
          if(id.indexOf('/node_modules/meteor/')===0) {
            module.prefetch('/node_modules/meteor/'+id.replace('/node_modules/meteor/','').replace('_',':')
            ).then(resolve).catch(reject);
          } else reject(err);
        })
      });
    })).then(function () {
      if (modules.length > 0) {
        setTimeout(function () {
          prefetchInChunks(modules, amount);
        }, 0);
      }
    });
  }

  // Get a flat array of modules and start prefetching.
  prefetchInChunks(getFlatModuleArray(versions), 50);
}
