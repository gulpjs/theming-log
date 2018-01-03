'use strict';

var isString = require('@fav/type.is-string');
var isFunction = require('@fav/type.is-function');

function applyTheme(parsed, themeSet) {
  return applyThemeToEachNodes(parsed.nodes, null, themeSet);
}

function applyThemeToEachNodes(nodes, themeName, themeSet) {
  var text = '';

  for (var i = 0, n = nodes.length; i < n; i++) {
    var node = nodes[i];
    if (isString(node)) {
      text += node;
    } else {
      if (isString(node.text)) {
        text += findTheme(node.theme, themeSet)(node.text);
      } else {
        text += applyThemeToEachNodes(node.nodes, node.theme, themeSet);
      }
    }
  }

  return findTheme(themeName, themeSet)(text);
}

function findTheme(themeName, themeSet) {
  var theme = themeSet[themeName];

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
