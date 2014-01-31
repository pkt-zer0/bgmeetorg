/* global Meteor, Template, _, toggle, availabilityData */

// TODO?: Maybe have exceptionStart and calendarStart be shared in the session?
var calendarStart = _.sessionVar('calendarStart');

// Events
Template.events.helpers({
  pagerSettings: { before: 1, middle: 5 }
, header : function () {
    // TODO: Extract common logic
    var start = calendarStart.get() || Date.today()
      , week = _.datesFrom(start, 7)
      , dateFormat = "MMM d"
      , formatDate = function (date) { return date.toString(dateFormat); };
    return _.map(week, formatDate);
  }
, rows: function () {
    var users = Meteor.users.find({} , { sort: { 'profile.name': 1 } })
      , start = calendarStart.get() || Date.today()
      , getUserData = function (user) {
          var displayData = function (data) {
              var text = toggle.classes[data.combined];
              return _.extend(data, {
                text: text
              , css: text
              });
            }
            , availability = _.map(availabilityData(start, user), displayData);
          return {
            name: user.profile.name
          , available: availability
          };
        };
    return users.map(getUserData);
  }
});
Template.events.events({
  'click .pager .prev' : function () { calendarStart.alter(_.addWeeks(-1)); }
, 'click .pager .next' : function () { calendarStart.alter(_.addWeeks(1)); }
});

//-- Startup --
Meteor.startup(function () {
  var thisWeek = _.startOfWeek(Date.today());
  calendarStart.setDefault(thisWeek);
});
