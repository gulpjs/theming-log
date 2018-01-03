'use strict';

var fs = require('fs');
var encoding = 'utf-8';


function concatFile(sourceFile, targetFile, converter) {
  var data = fs.readFileSync(sourceFile, encoding);
  if (typeof converter === 'function') {
    data = converter(data);
  }
  fs.appendFileSync(targetFile, data, encoding);
}

module.exports = concatFile;
