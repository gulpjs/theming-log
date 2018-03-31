'use strict';

var toInteger = require('@fav/type.to-integer');

function isArgTheme(themeName) {
  return /^[1-9][0-9]*$/.test(themeName);
}

function convertArgTheme(args, themeName /* , nodeText */) {
  var argIndex = toInteger(themeName);
  if (!argIndex || argIndex >= args.length || argIndex <= 0) {
    return '';
  }

  return args[argIndex];
}

module.exports = {
  is: isArgTheme,
  convert: convertArgTheme,
};
