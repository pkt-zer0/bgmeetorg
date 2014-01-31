/* global Accounts, _ */

Accounts.onCreateUser(function(options, user) {
  var email = user.emails[0].address
    , defaultName = email.split("@")[0];
  var defaultProfile = {
    available: _.repeat(7, "n")
  , name: defaultName
  };
  user.profile = _.extend(defaultProfile, options.profile);
  return user;
});