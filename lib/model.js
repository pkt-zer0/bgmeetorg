/* global Meteor, _, Email, Exceptions:true, Events:true,
  availabilityData:true, availableOnDate:true, createEvent:true, upcomingEvents:true
*/

Exceptions = new Meteor.Collection("exceptions");
Events = new Meteor.Collection("events");

// TODO: Convert these to Meteor methods.
var availability = function (user, date) {
  var weekly = user.profile.available;
  var doc = Exceptions.findOne(
        { userId: user._id, date: date }
      , { available: 1 }
      )
    , defaults = { available: '' }
    , data = _.extend(defaults, doc) // This is a bit hacky, but whatever
    , override = data.available
    , regular = weekly[_.dayOfWeek(date)]
    , combined = override || regular;
  return {
      regular: regular
    , override: override
    , combined: combined
    , doc: data._id // TODO: Rename to exceptionDoc?
    };
};
// TODO: Rename to weeklyAvailability or something
/**
 * Returns a weeks' availability information for a given user, starting with the given date.
 */
availabilityData = function (start, user) {
  var days = _.datesFrom(start, 7);
  return _.map(days, function (date) {
    var base = availability(user, date);
    return _.extend(base, { date: date });
  });
};
/**
 * Returns the users available on a given day within a group.
 */
// TODO: Filter by group
availableOnDate = function (date) {
  var propFilter = function (prop, value) {
      return function (obj) {
        return obj[prop] === value;
      };
    }
    // TODO: Move available out of profile.
    , members = Meteor.users.find({}, { 'profile.name': 1, 'profile.available': 1 })
    , memberData = members.map(function (user) {
        var rawData = availability(user, date);
        return {
          available: rawData.combined
        , name: user.profile.name
        , id: user._id
        };
      });
  return _.filter(memberData, propFilter('available', 'y'));
};
// TODO: Wrapper for exposing Meteor methods as functions (like this one)
createEvent = function (opts) {
  Meteor.call('createEvent', opts);
};
Meteor.methods({
  createEvent : function (opts) {
    // TODO: Disallow creating events with no title or zero attendees; or in the past
    var date = opts.date
      , title = opts.title
      , attendees = opts.attendees
      , shortDate = date.toString("d")
      , longDate = date.toString("D");
    Events.insert({
      date: date
    , title: title
    , attendees: attendees
    });
    // TODO: Use a string.format type method here
    if (Meteor.isServer) {
      _.each(attendees, function (userId) {
        var user = Meteor.users.findOne(userId)
          , email = user.emails[0].address
          , subject = 'Invitation: ' + title + ' (' + shortDate + ')'
          , text = "Hi! You've been invited to \"" + title + "\" on " + longDate + ".";
        Email.send({
          from: 'noreply@meetorg.meteor.com'
        , to: email
        , subject: subject
        , text: text
        });
      });
    }
  }
});

upcomingEvents = function (start) {
  var end = start.clone().add(2).weeks();
  return Events.find(
    { date: { $gte: start, $lt: end } }
  , { sort: { date: 1 } }
  );
};