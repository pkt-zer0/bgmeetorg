/* global Meteor, Template, _ */

var currentTab = _.sessionVar('currentTab');

// Tab menu
var tabs =
  [ { text: "Settings", template: "settings" }
  , { text: "Events", template: "events" }
  , { text: "Games", template: "games" }
  ];
Template.tabMenu.helpers({
  tabs : tabs
, currentTab : function() {
    var tabTemplate = currentTab.get() || tabs[0].template;
    return Template[tabTemplate]();
  }
, selected: function() {
    return currentTab.equals(this.template) ? "selected" : "";
  }
});
Template.tabMenu.events({
  'click .tabMenu li' : function () {
    currentTab.set(this.template);
  }
});

//-- Client startup --
Meteor.startup(function () {
  currentTab.setDefault(tabs[0].template);
});

// TODO: display aggregated availability in a table (under events)
// TODO: Chat
// TODO: Remove autopublish, manually manage subscriptions
// TODO: Game groups -> use publish/subscribe to cache only data for the group
// TODO?: Cleanup of old exceptions (on server startup?).
// TODO? --> or just remove non-overriding entries?
// TODO?: Normalize timezones of dates to UTC?
