console.log('dynamic-package:client');

const myPackageMethod = () => {
  import('./myImportedPackageMethod').then(({ myImportedPackageMethod }) => myImportedPackageMethod());
}

export { myPackageMethod }