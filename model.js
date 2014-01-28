/* global Meteor, _, Exceptions:true, availabilityData:true */

Exceptions = new Meteor.Collection("exceptions");

// TODO: version that filters by users
availabilityData = function (start) {
  var addDays = function (num) {
        return start.clone().add(num).days();
      }
    , days = _.map(_.range(7), addDays)
    , weekly = Meteor.user().profile.available;
  return _.map(days, function (date) {
    var doc = Exceptions.findOne(
          { userId: Meteor.userId(), date: date }
        , { available: 1 }
        )
      , defaults = { available: '' }
      , data = _.extend(defaults, doc)
      , regular = weekly[_.dayOfWeek(date)];
    return {
      date: date
    , regular: regular
    , override: data.available
    , doc: data._id
    };
  });
};