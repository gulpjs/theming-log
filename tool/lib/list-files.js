'use strict';

var fs = require('fs');
var path = require('path');
var encoding = 'utf-8';

function listFiles(filepath, extensions) {
  extensions = Array.isArray(extensions) ? extensions : [extensions];
  return fs.readdirSync(filepath, encoding)
    .filter(ignoreDots)
    .filter(isExtension)
    .map(resolve);

  function ignoreDots(filename) {
    return !filename.startsWith('.');
  }

  function isExtension(filename) {
    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];
      if (!ext || filename.slice(-ext.length) === ext) {
        return true;
      }
    }
  }

  function resolve(filename) {
    return path.resolve(filepath, filename);
  }
}

module.exports = listFiles;
