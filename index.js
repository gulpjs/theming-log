'use strict';

var parseTextWithTheme = require('./lib/parse-text-with-theme');
var applyTheme = require('./lib/apply-theme');

function themingLog(theme, logger) {
  logger = logger || console.log;

  return function(text) {
    logger(applyTheme(parseTextWithTheme(text), theme));
  };
}

module.exports = themingLog;
