'use strict';

var isString = require('@fav/type.is-string');
var isFunction = require('@fav/type.is-function');
var getDeep = require('@fav/prop.get-deep');
var argTheme = require('./arg-theme');

function applyTheme(parsed, themeSet, args) {
  return applyThemeToEachNodes(parsed.nodes, null, themeSet, args || []);
}

function applyThemeToEachNodes(nodes, themeName, themeSet, args) {
  var text = '';

  for (var i = 0, n = nodes.length; i < n; i++) {
    var node = nodes[i];
    if (isString(node)) {
      text += node;
    } else {
      if (argTheme.is(node.theme)) {
        text += argTheme.convert(args, node.theme, node.text);
      } else if (isString(node.text)) {
        text += findTheme(node.theme, themeSet)(node.text);
      } else {
        text += applyThemeToEachNodes(node.nodes, node.theme, themeSet, args);
      }
    }
  }

  return findTheme(themeName, themeSet)(text);
}

function findTheme(themeName, themeSet) {
  if (!isString(themeName)) {
    return noop;
  }

  var theme = getDeep(themeSet, themeName.split('.'));

  if (isFunction(theme)) {
    return theme;
  }

  if (isString(theme)) {
    return findTheme(theme, themeSet);
  }

  return noop;
}

function noop(text) {
  return text;
}

module.exports = applyTheme;
