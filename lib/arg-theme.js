'use strict';

function isArgTheme(themeName) {
  return /^[1-9][0-9]*$/.test(themeName);
}

function convertArgTheme(args, themeName /* , nodeText */) {
  if (!isArgTheme(themeName)) {
    return '';
  }
  var argIndex = Number(themeName);
  if (argIndex >= args.length || argIndex <= 0) {
    return '';
  }
  return args[argIndex];
}

module.exports = {
  is: isArgTheme,
  convert: convertArgTheme,
};
