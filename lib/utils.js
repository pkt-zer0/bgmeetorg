/* global Session, _ */

_.repeat = function(n, value) {
  var i, arr = [];
  for (i = 0; i < n; i += 1) {
    arr.push(value);
  }
  return arr;
};
_.method = function(obj, name) {
  var args = _.toArray(arguments).slice(2)
    , func = obj[name];
  return _.bind.apply(this, [func, obj].concat(args));
};

_.mapPairs = _.compose(_.object, _.map);
_.mapObj = function (obj, iterator) {
  var pairIterator = function (value, key, list) {
    return [value, iterator(value, key, list)];
  };
  return _.mapPairs(obj, pairIterator);
};

/**
 * Returns an object with a single field of the given name.
 */
_.field = function (name, value) {
  var obj = {};
  obj[name] = value;
  return obj;
};

_.startOfWeek = function(date) {
  return date.is().monday() ? date : date.previous().monday();
};

_.sessionVar = function (name) {
  return _.mapObj(['get', 'set', 'setDefault', 'equals'], function (func) {
    return _.method(Session, func, name);
  });
};