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

// TODO: Put these into a separate date utility lib
_.startOfWeek = function(date) {
  return date.is().monday() ? date : date.previous().monday();
};
_.dayOfWeek = function(date) {
  return (date.getDay() + 6) % 7;
};
_.addWeeks = function (num) {
  return function (date) {
    // Check for undefined, just in case
    return date && date.clone().add(num).weeks();
  };
};
_.addDays = function (date, num) {
  return date.clone().add(num).days();
};
_.datesFrom = function (start, len) {
  return _.map(_.range(len), _.partial(_.addDays, start));
};

// TODO: dependencyVar (non-global var with notification tracking)
_.sessionVar = function (name) {
  var methods = ['get', 'set', 'setDefault', 'equals']
    , base = _.mapObj(methods, function (func) {
        return _.method(Session, func, name);
      })
    , extensions = {
      alter: function (mapFunc) {
        var curr = base.get()
          , newValue = mapFunc(curr);
        base.set(newValue);
      }
    };
  return _.extend(base, extensions);
};