'use strict';

var ignoredProperties = [
  '__proto__',
  'constructor',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
];

function getDeep(obj, propPath) {
  if (arguments.length < 2) {
    return obj;
  }

  if (!Array.isArray(propPath)) {
    return undefined;
  }

  if (obj == null) {
    return propPath.length ? undefined : obj;
  }

  for (var i = 0, n = propPath.length; i < n; i++) {
    var prop = propPath[i];
    if (Array.isArray(prop)) {
      // This function doesn't allow to use an array as a property.
      return undefined;
    }

    if (ignoredProperties.indexOf(prop) !== -1) {
      return undefined;
    }

    obj = obj[prop];
    if (obj == null) {
      break;
    }
  }

  return obj;
}

module.exports = getDeep;
