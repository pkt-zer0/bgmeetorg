/* global Meteor, Template, _, Exceptions */


var next = function (values) {
    return function (v) {
      var index = _.indexOf(values, v);
      return index === -1 ?
        undefined :
        values[(index + 1) % values.length];
    };
  }
  , toggleClasses =
    { y : 'yes'
    , n : 'no'
    , '': ''
    }
  , yesNo = ['y', 'n']
  , nextYesNo = next(yesNo)
  , yesNoEmpty = yesNo.concat([''])
  , nextYesNoEmpty = next(yesNoEmpty)
  , dateFormat = "MMM d"
  , exceptionsStart = _.sessionVar('exceptionsStart');

// Regular
Template.regular.helpers({
  days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  available : function() {
    // TODO?: Use a separate collection for this, rather than the profile?
    var data = Meteor.user().profile.available;
    return _.map(data, function(value, index) {
      var toggleName = toggleClasses[value];
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
      , newValue = nextYesNo(this.data);
    Meteor.users.update(
      { _id: Meteor.userId() }
    , { $set: _.field(fieldName, newValue) }
    );
  }
});

// Exceptions
var alterWeek = function (diff) {
      var newWeek = exceptionsStart.get().add(diff).weeks();
      exceptionsStart.set(newWeek);
    }
  , selfAvailability = function() {
      var start = exceptionsStart.get() || Date.today();
      return availabilityData(start);
    };
Template.exceptions.helpers({
  // TODO: Display year + month in a row above, with colspans.
  // TODO: Bottom header row is day + date (e.g. Mon 12)
  days : function () {
    return _.map(selfAvailability(), function (data) {
      return data.date.toString(dateFormat);
    });
  }
, available : function () {
    return _.map(selfAvailability(), function (data) {
      var overrideName = toggleClasses[data.override]
        , regularCss = toggleClasses[data.regular] + "-def"
        , css = [overrideName, regularCss].join(" ");
      return _.extend(data, {
        text: overrideName
      , css: css
      });
    });
  }
});
Template.exceptions.events({
  'click .pager .prev' : _.partial(alterWeek, -1)
, 'click .pager .next' : _.partial(alterWeek, 1)
, 'click .toggle' : function () {
    var newValue = nextYesNoEmpty(this.override)
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

//-- Client startup --
Meteor.startup(function () {
  var thisWeek = _.startOfWeek(Date.today());
  exceptionsStart.setDefault(thisWeek);
});
