/* global Meteor, Template, Deps, _, toggle,
  availabilityData, availableOnDate, createEvent, upcomingEvents
*/

// TODO: Use non-global change-tracked variables instead
// TODO?: Maybe have exceptionStart and calendarStart be shared in the session?
var calendarStart = _.sessionVar('calendarStart')
  , selectedDate = _.sessionVar('selectedDate')
  , attendees = _.sessionVar('attendees');

// Calendar
Template.calendar.helpers({
  pagerSettings: { before: 1, middle: 5 }
, header : function () {
    // TODO: Extract common logic
    var start = calendarStart.get()
      , week = _.datesFrom(start, 7)
      , dateFormat = "MMM d";
    return _.map(week, function (date) {
      var css = selectedDate.equals(date) && 'selected';
      return {
        date: date
      , text: date.toString(dateFormat)
      , css: css
      };
    });
  }
, rows: function () {
    var users = Meteor.users.find({} , { sort: { 'profile.name': 1 } })
      , start = calendarStart.get() || Date.today()
      // TODO: use partial
      , getUserData = function (user) {
          return {
            user: user
          , available: availabilityData(start, user)
          };
        }
      , userData = users.map(getUserData)
      , availableUsers = _.filter(userData, function (user) {
          return _.any(user.available, function (data) {
            return data.combined === 'y';
          });
        })
      , displayAvailability = function (data) {
          var text = toggle.classes(data.combined);
          return _.extend(data, {
            text: text
          , css: text
          });
        }
      , displayUserData = function (data) {
          return {
            name: data.user.profile.name
          , available: _.map(data.available, displayAvailability)
          };
        };
    return _.map(availableUsers, displayUserData);
  }
});
Template.calendar.events({
  'click .pager.prev' : function () { calendarStart.alter(_.addWeeks(-1)); }
, 'click .pager.next' : function () { calendarStart.alter(_.addWeeks(1)); }
, 'click .schedule .clickable': function() {
    var selection = this.date
      , newValue = selectedDate.equals(selection) ? undefined : selection;
    selectedDate.set(newValue);
  }
});

// Add event
attendees.setDefault([]);
Deps.autorun(function () {
  var eventDate = selectedDate.get()
    , available = _.isDate(eventDate) ? availableOnDate(eventDate) : [];
  attendees.set(available);
});
Template.addEvent.helpers({
  date: function() {
    var date = selectedDate.get()
      , dateFormat = "D";
    return date && date.toString(dateFormat);
  }
, attendees: attendees.get
});
Template.addEvent.events({
  'click button': function() {
    var title = $('#event_name').val()
      , date = selectedDate.get()
      , members = _.pluck(attendees, 'id');
    createEvent({
      title: title
    , date: date
    , attendees: members
    });
    selectedDate.set(undefined);
  }
});

// Upcoming
Template.upcoming.helpers({
  upcoming: function () {
    var displayEvent = function (event) {
      return {
        title: event.title
      , date: event.date.toString("D")
      };
    };
    return upcomingEvents(Date.today()).map(displayEvent);
  }
});

//-- Startup --
var thisWeek = _.startOfWeek(Date.today());
calendarStart.setDefault(thisWeek);
Deps.autorun(function () {
  Meteor.subscribe("group-availability", calendarStart.get());
  Meteor.subscribe("events"); //TODO: upcoming events only. use calendar Start? currentDate?
});

// TODO: email notification for invites
// TODO: Available poeple are only defaults, can exclude them individually
// TODO?: "My events" on settings (profile) page?
// TODO: Recurring events
// TODO: Create event starting with game (find suitable dates within a timerange)
// TODO: Summary row with the number of people
