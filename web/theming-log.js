(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.themingLog = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./lib/apply-theme":2,"./lib/parse-themed-text":4}],2:[function(require,module,exports){
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

},{"./arg-theme":3,"./parse-themed-text":4,"@fav/prop.get-deep":6,"@fav/type.is-function":9,"@fav/type.is-string":10}],3:[function(require,module,exports){
'use strict';

var toInteger = require('@fav/type.to-integer');

function isArgTheme(themeName) {
  return /^[1-9][0-9]*$/.test(themeName);
}

function convertArgTheme(args, themeName /* , nodeText */) {
  var argIndex = toInteger(themeName);
  if (!argIndex || argIndex >= args.length || argIndex <= 0) {
    return '';
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
    if (Array.isArray(prop)) {
      // This function doesn't allow to use an array as a property.
      return undefined;
    }

    obj = obj[prop];
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

var isFiniteNumber = require('@fav/type.is-finite-number');
var toNumber = require('@fav/type.to-number');

function toInteger(value) {
  value = toNumber(value);

  if (isFiniteNumber(value)) {
    return value < 0 ? Math.ceil(value) : Math.floor(value);
  }

  if (arguments.length > 1) {
    return arguments[1];
  }

  return NaN;
}

module.exports = toInteger;

},{"@fav/type.is-finite-number":8,"@fav/type.to-number":12}],12:[function(require,module,exports){
'use strict';

var isString = require('@fav/type.is-string');

function toNumber(value) {
  if (typeof value === 'number') {
    if (value === value) {
      return value;
    }

  } else if (isString(value)) {
    if (value && !/ /.test(value)) {
      value = Number(value);
      if (value === value) {
        return value;
      }
    }
  }

  if (arguments.length > 1) {
    return arguments[1];
  }
  return NaN;
}

module.exports = toNumber;

},{"@fav/type.is-string":10}]},{},[1])(1)
});
