/* global _, toggle:true */

//-- Yes/No toggle --
toggle = (function () {
  // TODO: Probably move "next" to util.
  var next = function (values) {
        return function (v) {
          var index = _.indexOf(values, v);
          return index === -1 ?
            undefined :
            values[(index + 1) % values.length];
        };
      }
    , classes = { y : 'yes', n : 'no' }
    , yesNo = ['y', 'n']
    , yesNoEmpty = yesNo.concat([''])
    , nextYesNo = next(yesNo)
    , nextYesNoEmpty = next(yesNoEmpty);
  return {
    classes: function (value) { return classes[value] || ''; }
  , yesNo: yesNo
  , yesNoEmpty: yesNoEmpty
  , nextYesNo: nextYesNo
  , nextYesNoEmpty: nextYesNoEmpty
  };
}());
