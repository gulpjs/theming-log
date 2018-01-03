(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.themingLog = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./lib/apply-theme":2,"./lib/parse-text-with-theme":3}],2:[function(require,module,exports){
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

},{"@fav/type.is-function":4,"@fav/type.is-string":5}],3:[function(require,module,exports){
'use strict';

var isString = require('@fav/type.is-string');

function parseTextWithTheme(text) {
  if (!isString(text) || !text) {
    return { nodes: [''] };
  }

  return parseTextStructure(text);
}

function parseTextStructure(text) {
  var parsed = { _rest: text, _text: '', /* _theme: null */ };
  var openCount = 0;

  var found;
  while ((found = parsed._rest.match(/[\\{}]/))) {
    switch (parsed._rest[found.index]) {
      case '\\': {
        escapeCharacter(parsed, found.index);
        break;
      }
      case '{': {
        if (!openCount) {
          addPreviousText(parsed, found.index);
          extractThemeName(parsed);
        } else {
          nextCharacter(parsed, found.index);
        }
        openCount++;
        break;
      }
      //case '}':
      default: {
        openCount--;
        if (!openCount) {
          addPreviousBlock(parsed, found.index);
        } else {
          nextCharacter(parsed, found.index);
        }
        break;
      }
    }
  }

  if (parsed._rest || parsed._text || parsed._theme) {
    if (!openCount) {
      addPreviousText(parsed, parsed._rest.length);
    } else {
      addPreviousBlock(parsed, parsed._rest.length);
    }
  }
  delete parsed._rest;
  delete parsed._text;

  return parsed;
}

function escapeCharacter(parsed, escapeMarkIndex) {
  parsed._text += parsed._rest.slice(0, escapeMarkIndex);
  if (parsed._theme) {
    parsed._text += parsed._rest[escapeMarkIndex];
  }
  parsed._text += parsed._rest[escapeMarkIndex + 1] || '';
  parsed._rest = parsed._rest.slice(escapeMarkIndex + 2);
}

function nextCharacter(parsed, bracketMarkIndex) {
  var index = bracketMarkIndex + 1;
  parsed._text += parsed._rest.slice(0, index);
  parsed._rest = parsed._rest.slice(index);
}

function addPreviousText(parsed, bracketMarkIndex) {
  var text = parsed._text + parsed._rest.slice(0, bracketMarkIndex);
  if (text) {
    if (!Array.isArray(parsed.nodes)) {
      parsed.nodes = [];
    }
    parsed.nodes.push(text);
  }

  parsed._rest = parsed._rest.slice(bracketMarkIndex + 1);
  parsed._text = '';
  delete parsed._theme;
}

function addPreviousBlock(parsed, bracketMarkIndex) {
  var text = trim(parsed._text + parsed._rest.slice(0, bracketMarkIndex));
  if (text) {
    if (!Array.isArray(parsed.nodes)) {
      parsed.nodes = [];
    }

    var theme = parsed._theme;
    if (!theme) {
      parsed.nodes.push(unescape(text));
    } else {
      var childParsed = parseTextStructure(text);
      if (childParsed.nodes.length === 1 && isString(childParsed.nodes[0])) {
        parsed.nodes.push({ theme: theme, text: childParsed.nodes[0] });
      } else {
        parsed.nodes.push({ theme: theme, nodes: childParsed.nodes });
      }
    }
  } else if (parsed._theme) {
    if (!Array.isArray(parsed.nodes)) {
      parsed.nodes = [];
    }
    parsed.nodes.push({ theme: parsed._theme, text: '' });
  }

  parsed._rest = parsed._rest.slice(bracketMarkIndex + 1);
  parsed._text = '';
  delete parsed._theme;
}

function extractThemeName(parsed) {
  var found = parsed._rest.match(/[:}]/);
  var foundIndex = found ? found.index : parsed._rest.length;

  parsed._theme = parsed._rest.slice(0, foundIndex).trim();

  if (parsed._rest[foundIndex] === ':') {
    foundIndex++;
  }
  parsed._rest = parsed._rest.slice(foundIndex);
}

function trim(text) {
  text = text.replace(/^\s+/, '');
  if (text[0] === '\\') {
    text = text.slice(1);
  }

  var found = text.match(/\s+$/);
  if (!found) {
    return text;
  }
  if (text[found.index - 1] !== '\\') {
    return text.slice(0, found.index);
  }
  /* istanbul ignore next */
  var escapedSpace = text[found.index] || '';
  return text.slice(0, found.index - 1) + escapedSpace;
}

module.exports = parseTextWithTheme;

},{"@fav/type.is-string":5}],4:[function(require,module,exports){
'use strict';

function isFunction(value) {
  return (typeof value === 'function');
}

function isNotFunction(value) {
  return (typeof value !== 'function');
}

Object.defineProperty(isFunction, 'not', {
  enumerable: true,
  value: isNotFunction,
});

module.exports = isFunction;

},{}],5:[function(require,module,exports){
'use strict';

function isString(value) {
  if (typeof value === 'string') {
    return true;
  }
  if (Object.prototype.toString.call(value) === '[object String]') {
    return true;
  }
  return false;
}

function isNotString(value) {
  return !isString(value);
}

Object.defineProperty(isString, 'not', {
  enumerable: true,
  value: isNotString,
});

module.exports = isString;

},{}]},{},[1])(1)
});