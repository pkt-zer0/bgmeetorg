/* global Meteor, Template, _, Exceptions, toggle, availabilityData */

var dateFormat = "MMM d"
  , exceptionsStart = _.sessionVar('exceptionsStart');

// Settings
var updateUsername = function () {
  var input = $('#username');
  var newName = input.val();
  if (newName) {
    Meteor.users.update(
      { _id: Meteor.userId() },
      { $set: { 'profile.name' : newName } }
    );
  }
};
Template.settings.helpers({
  username: function () { return Meteor.user().profile.name; }
});
Template.settings.events({
  'blur #username': updateUsername
, 'keyup #username': function (event) {
    if (event.which === 13) { updateUsername(); }
  }
});

// Regular
Template.regular.helpers({
  days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  available : function() {
    // TODO?: Use a separate collection for this, rather than the profile?
    var data = Meteor.user().profile.available;
    return _.map(data, function(value, index) {
      var toggleName = toggle.classes(value);
      return {
        data: value
      , css: toggleName
      , text: toggleName
      , index: index
      };
    });
  }
});
Template.regular.events({
  'click .toggle' : function() {
    var fieldName = 'profile.available.' + this.index
      , newValue = toggle.nextYesNo(this.data);
    Meteor.users.update(
      { _id: Meteor.userId() }
    , { $set: _.field(fieldName, newValue) }
    );
  }
});

// Exceptions
var selfAvailability = function() {
  var start = exceptionsStart.get() || Date.today();
  return availabilityData(start, Meteor.user());
};
Template.exceptions.helpers({
  // TODO: Display year + month in a row above, with colspans.
  // TODO: Bottom header row is day + date (e.g. Mon 12)
  days : function () {
    var start = exceptionsStart.get() || Date.today();
    return _.map(_.datesFrom(start, 7), function (date) {
      return date.toString(dateFormat);
    });
  }
, available : function () {
    return _.map(selfAvailability(), function (data) {
      var overrideName = toggle.classes(data.override)
        , regularCss = toggle.classes(data.regular) + "-def"
        , css = [overrideName, regularCss].join(" ");
      return _.extend(data, {
        text: overrideName
      , css: css
      });
    });
  }
, pagerSettings : { middle: 5 } // FIXME: Remove this
});
Template.exceptions.events({
  'click .pager .prev' : function () { exceptionsStart.alter(_.addWeeks(-1)); }
, 'click .pager .next' : function () { exceptionsStart.alter(_.addWeeks(1)); }
, 'click .toggle' : function () {
    // TODO: Upsert the opposite of regular availability as the exception, if nothing set/same as regular.
    // TODO: If already set, remove existing entry instead.
    var newValue = toggle.nextYesNoEmpty(this.override)
      , doc = this.doc;
    // NOTE: Could use upsert here, but that'd need a Meteor method, it seems
    if (doc) {
      Exceptions.update(
        { _id: doc }
      , { $set: { available: newValue } }
      );
    } else {
      Exceptions.insert({
        userId: Meteor.userId()
      , date: this.date
      , available: newValue
      });
    }
  }
});

//-- Startup --
Meteor.startup(function () {
  var thisWeek = _.startOfWeek(Date.today());
  exceptionsStart.setDefault(thisWeek);
});