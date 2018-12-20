'use strict';

var isString = require('@fav/type.is-string');
var isFunction = require('@fav/type.is-function');
var getDeep = require('@fav/prop.get-deep');
var argTheme = require('./arg-theme');
var parseThemedText = require('./parse-themed-text');

function applyTheme(parsed, themeSet, args) {
  return applyThemeToEachNodes(parsed.nodes, null, themeSet, args || []);
}

function applyThemeToEachNodes(nodes, themeName, themeSet, args) {
  var text = '';

  for (var i = 0, n = nodes.length; i < n; i++) {
    var node = nodes[i];
    if (isString(node)) {
      text += node;
    } else if (argTheme.is(node.theme)) {
      text += argTheme.convert(args, node.theme, node.text);
    } else if (isString(node.text)) {
      var theme0 = getDeep(themeSet, node.theme.split('.'));
      if (isFunction(theme0)) {
        text += theme0(node.text);
      } else if (isString(theme0)) {
        var parsed0 = parseThemedText(theme0);
        var args0 = [undefined, node.text];
        text += applyThemeToEachNodes(parsed0.nodes, null, themeSet, args0);
      } else {
        text += node.text;
      }
    } else {
      text += applyThemeToEachNodes(node.nodes, node.theme, themeSet, args);
    }
  }

  if (isString(themeName)) {
    var theme1 = getDeep(themeSet, themeName.split('.'));
    if (isFunction(theme1)) {
      return theme1(text);
    } else if (isString(theme1)) {
      var parsed1 = parseThemedText(theme1);
      var args1 = [undefined, text];
      return applyThemeToEachNodes(parsed1.nodes, null, themeSet, args1);
    }
  }
  return text;
}

module.exports = applyTheme;
