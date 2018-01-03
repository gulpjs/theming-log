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
