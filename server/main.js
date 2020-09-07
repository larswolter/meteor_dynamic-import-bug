import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});
// Also test if server side dynamic imports still work
Meteor.methods({
click() {
  import('../imports/imported').then(({ showImportedStuff }) => {
    console.log(showImportedStuff());
  });
}
});
