'use strict';

var fs = require('fs');

function truncFile(filepath) {
  fs.openSync(filepath, 'w+');
}

module.exports = truncFile;
