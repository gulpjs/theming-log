'use strict';

var parseThemedText = require('./lib/parse-themed-text');
var applyTheme = require('./lib/apply-theme');

function themingLog(theme, logger) {
  logger = logger || console.log;

  return function(text /*, ...args */) {
    logger(applyTheme(parseThemedText(text), theme, arguments));
  };
}

function format(theme, text /* , ...args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return applyTheme(parseThemedText(text), theme, args);
}

Object.defineProperty(themingLog, 'format', {
  enumerable: true,
  value: format,
});

module.exports = themingLog;
