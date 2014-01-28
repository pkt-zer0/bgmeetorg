/* global Meteor, Template, _, Exceptions */

if (Meteor.isClient) {
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

  // Common utils
  var dailyData = function () {
    var start = exceptionsStart.get() || Date.today()
      , addDays = function (num) {
          return start.clone().add(num).days();
        }
      , days = _.map(_.range(7), addDays);
    return _.map(days, function (date) {
      var doc = Exceptions.findOne(
            { userId: Meteor.userId(), date: date }
          , { available: 1 }
          )
        , defaults = { available: '' }
        , data = _.extend(defaults, doc);
      return {
        date: date
      , shortDate: date.toString(dateFormat)
      , value: data.available
      , doc: data._id
      };
    });
  };

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
  };
  Template.exceptions.helpers({
    // TODO: Display year + month in a row above, with colspans.
    // TODO: Bottom header row is day + date (e.g. Mon 12)
    days : function () { return _.pluck(dailyData(), 'shortDate'); }
  , available : function () {
      return _.map(dailyData(), function (data) {
        var toggleClass = toggleClasses[data.value];
        return _.extend(data, {
          text: toggleClass || ' '
        , css: toggleClass
        });
      });
    }
  });
  Template.exceptions.events({
    'click .pager .prev' : _.partial(alterWeek, -1)
  , 'click .pager .next' : _.partial(alterWeek, 1)
  , 'click .toggle' : function () {
      var newValue = nextYesNoEmpty(this.value)
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
}