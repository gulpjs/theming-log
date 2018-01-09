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
