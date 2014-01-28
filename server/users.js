/* global Accounts, _ */

Accounts.onCreateUser(function(options, user) {
  var defaultProfile = {
    available: _.repeat(7, "n")
  };
  user.profile = _.extend(defaultProfile, options.profile);
  return user;
});