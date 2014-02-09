/* global Meteor, Template, Deps, _, Exceptions, toggle, availabilityData */

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
    // TODO?: Use a separate field for this, not in the profile
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
  var start = exceptionsStart.get();
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
});
Template.exceptions.events({
  'click .pager.prev' : function () { exceptionsStart.alter(_.addWeeks(-1)); }
, 'click .pager.next' : function () { exceptionsStart.alter(_.addWeeks(1)); }
, 'click .toggle' : function () {
    var oldValue = this.override
      , newValue = toggle.nextYesNo(this.regular)
      , doc = this.doc;
    // No longer an exception, corresponding document (if any) can be removed
    if (oldValue === newValue) {
      if (doc) {
        Exceptions.remove({ _id: doc });
      }
    }
    // Insert an exception, or update the existing one
    else if (doc) {
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
var thisWeek = _.startOfWeek(Date.today());
exceptionsStart.setDefault(thisWeek);
Deps.autorun(function () {
  Meteor.subscribe("user-availability", exceptionsStart.get(), Meteor.userId());
});