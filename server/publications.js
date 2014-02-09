/* global Meteor, Exceptions, Events */

Meteor.publish("user-availability", function (current, userId) {
  var start = current.clone().add(-1).weeks()
    , end = start.clone().add(2).weeks();
  return Exceptions.find({
    userId: userId
  , date: { $gte: start, $lt: end }
  });
});
// TODO: Add group ID here eventually
Meteor.publish("group-availability", function (current) {
  var start = current.clone().add(-1).weeks()
    , end = start.clone().add(2).weeks();
  return [
    Meteor.users.find({}) // TODO: Filter by group
  , Exceptions.find({ date: { $gte: start, $lt: end } })
  ];
});
// TODO: get events only in a range (next two weeks?)
Meteor.publish("events", function () {
  return Events.find();
});