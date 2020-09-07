# meteor_dynamic-import-bug

Reproduction for [Meteor Issue 11157](https://github.com/meteor/meteor/issues/11157)

Run with 
`meteor --production` to enable precaching

## Error 2
After some more debugging, i found out why the dynamic module from the package is not prefetched. During prefetch the __DYNAMIC_VERSIONS__, that are generated during the build, are iterated and prefetched. In this Objekt the names of the imports get converted to file path compatible names, so :  is replaced with _  

![Versions]('Versions.png')

In the Module lookup (filesByModuleId) which is used during Module resolvement the original name is used.

![filesByModuleId]('filesByModule.png')

When resolving during a normal import the module resolvement happens in the context of the package. In my example the module imported is `./myImportedPackageMethod.js` And everything works. But if the prefetch is done, the module to resolve is `/node_modules/meteor/larswolter_dynamic-package/myImportedPackageMethod.js` and it exits when trying to resolve `larswolter_dynamic-package` because only `larswolter:dynamic-package` exists.

One way of resolving this issue is to try a second time if an error occurs during module loading.

```javascript
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

```

A cleaner way would be to supply a correct Versions Object to the client without the replacement, but that would involve more then updating the `dynamic-import` package.
