'use strict';

var parseThemedText = require('./lib/parse-themed-text');
var applyTheme = require('./lib/apply-theme');

function themingLog(theme, logger, lineSep) {
  if (typeof logger === 'boolean') {
    lineSep = logger;
    logger = console.log;
  } else if (typeof logger !== 'function') {
    logger = console.log;
  }

  return function(text /*, ...args */) {
    var text = applyTheme(parseThemedText(text), theme, arguments);
    if (lineSep) {
      var lines = text.split(/\r\n|\r|\n/);
      for (var i = 0, n = lines.length; i < n; i++) {
        logger(lines[i]);
      }
      return;
    }
    logger(text);
  };
}

function format(theme, text /* , ...args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return applyTheme(parseThemedText(text), theme, args);
}

function formatLines(/* theme, text, ...args */) {
  return format.apply(this, arguments).split(/\r\n|\r|\n/);
}

themingLog.format = format;
themingLog.formatLines = formatLines;

module.exports = themingLog;
