import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

let initialValue;
/* uncomment this and precaching will work
import('../imports/imported2').then(({ showImportedStuff }) => {
  initialValue = showImportedStuff();
});
*/
Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
  this.imported = new ReactiveVar(initialValue);
});

Template.hello.helpers({
  imported() {
    return Template.instance().imported.get();
  },
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
    instance.imported.set('importing...');
    import('../imports/imported').then(({ showImportedStuff }) => {
      instance.imported.set(showImportedStuff());
    });
  },
});
