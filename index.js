'use strict';

var parseThemedText = require('./lib/parse-themed-text');
var applyTheme = require('./lib/apply-theme');

function themingLog(theme, logger /* , ...args */) {
  logger = logger || console.log;

  return function(text) {
    logger(applyTheme(parseThemedText(text), theme, arguments));
  };
}

module.exports = themingLog;
