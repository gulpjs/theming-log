(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.themingLog = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./lib/apply-theme":2,"./lib/parse-themed-text":4}],2:[function(require,module,exports){
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

},{"./arg-theme":3,"@fav/prop.get-deep":6,"@fav/type.is-function":9,"@fav/type.is-string":10}],3:[function(require,module,exports){
'use strict';

var toInteger = require('@fav/type.to-integer');

function isArgTheme(themeName) {
  return /^[1-9][0-9]*$/.test(themeName);
}

function convertArgTheme(args, themeName, nodeText) {
  var argIndex = toInteger(themeName);
  if (!argIndex || argIndex >= args.length || argIndex <= 0) {
    return nodeText || '';
  }

  return args[argIndex];
}

module.exports = {
  is: isArgTheme,
  convert: convertArgTheme,
};

},{"@fav/type.to-integer":11}],4:[function(require,module,exports){
'use strict';

var isString = require('@fav/type.is-string');
var trimUnescapedSpaces = require('./trim-unescaped-spaces');

function parseThemedText(text) {
  if (!isString(text) || !text) {
    return { nodes: [''] };
  }

  return parseTextStructure(text);
}

function parseTextStructure(text) {
  var parsed = { _rest: text, _text: '', /* _theme: undefined */ };
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
          addTextNode(parsed, found.index);
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
          addBlockNode(parsed, found.index);
        } else {
          nextCharacter(parsed, found.index);
        }
        break;
      }
    }
  }

  if (parsed._rest || parsed._text || parsed._theme) {
    if (!openCount) {
      addTextNode(parsed, parsed._rest.length);
    } else {
      addBlockNode(parsed, parsed._rest.length);
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

function addTextNode(parsed, bracketMarkIndex) {
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

function addBlockNode(parsed, bracketMarkIndex) {
  var text = parsed._text + parsed._rest.slice(0, bracketMarkIndex);
  text = trimUnescapedSpaces(text);
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

module.exports = parseThemedText;

},{"./trim-unescaped-spaces":5,"@fav/type.is-string":10}],5:[function(require,module,exports){
'use strict';

function trimUnescapedSpaces(text) {
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

module.exports = trimUnescapedSpaces;

},{}],6:[function(require,module,exports){
'use strict';

var isArray = require('@fav/type.is-array');

function getDeep(obj, propPath) {
  if (arguments.length < 2) {
    return obj;
  }

  if (!isArray(propPath)) {
    return undefined;
  }

  if (obj == null) {
    return Boolean(propPath.length) ? undefined : obj;
  }

  for (var i = 0, n = propPath.length; i < n; i++) {
    var prop = propPath[i];
    try {
      obj = obj[prop];
    } catch (e) {
      // If `prop` is an array of Symbol, obj[prop] throws an error,
      // but this function suppress it and return undefined.
      obj = undefined;
    }
    if (obj == null) {
      break;
    }
  }

  return obj;
}

module.exports = getDeep;

},{"@fav/type.is-array":7}],7:[function(require,module,exports){
'use strict';

function isArray(value) {
  return Array.isArray(value);
}

function isNotArray(value) {
  return !Array.isArray(value);
}

Object.defineProperty(isArray, 'not', {
  enumerable: true,
  value: isNotArray,
});

module.exports = isArray;

},{}],8:[function(require,module,exports){
'use strict';

function isFiniteNumber(value) {
  if (typeof value === 'number') {
    return isFinite(value);
  }
  if (Object.prototype.toString.call(value) === '[object Number]') {
    return isFinite(value);
  }
  return false;
}

function isNotFiniteNumber(value) {
  return !isFiniteNumber(value);
}

Object.defineProperty(isFiniteNumber, 'not', {
  enumerable: true,
  value: isNotFiniteNumber,
});

module.exports = isFiniteNumber;

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
'use strict';

var isString = require('@fav/type.is-string');
var isFiniteNumber = require('@fav/type.is-finite-number');

function toInteger(value) {
  if (isString(value)) {
    value = parseFloat(value);
  }

  if (isFiniteNumber(value)) {
    return value < 0 ? Math.ceil(value) : Math.floor(value);
  }

  if (arguments.length > 1) {
    return arguments[1];
  }

  return NaN;
}

module.exports = toInteger;

},{"@fav/type.is-finite-number":8,"@fav/type.is-string":10}]},{},[1])(1)
});