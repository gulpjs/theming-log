'use strict';

var util = require('util');

function isString(s) {
  return typeof s === 'string' || util.types.isStringObject(s);
}

module.exports = isString;
