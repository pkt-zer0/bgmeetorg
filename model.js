/* global Meteor, _, Exceptions:true, availabilityData:true */

Exceptions = new Meteor.Collection("exceptions");

// TODO: fetch all exceptions in the range with one "between" query -> do this in the publish instead
availabilityData = function (start, user) {
  var days = _.datesFrom(start, 7)
    , weekly = user.profile.available;
  return _.map(days, function (date) {
    var doc = Exceptions.findOne(
          { userId: user._id, date: date }
        , { available: 1 }
        )
      , defaults = { available: '' }
      , data = _.extend(defaults, doc) // This is a bit hacky, but whatever
      , override = data.available
      , regular = weekly[_.dayOfWeek(date)]
      , combined = override || regular
      ;
    return {
      date: date
    , regular: regular
    , override: override
    , combined: combined
    , doc: data._id
    };
  });
};