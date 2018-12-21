'use strict';

/* eslint brace-style: off */

var chai = require('chai');
var expect = chai.expect;
var themingLog = require('..');

var formatLines = themingLog.formatLines;

describe('formatLines', function() {

  var theme = {
    red: function(v) { return 'RED:[' + v + ']'; },
    blue: function(v) { return 'BLUE:[' + v + ']'; },
  };

  it('Format text without eol', function() {
    var out = formatLines(theme, '{red: This text contains no eol}');
    expect(out).to.deep.equal([
      'RED:[This text contains no eol]',
    ]);
  });

  it('Format text with eol', function() {
    var out = formatLines(theme,
      '{blue: This text }\n' +
      '{blue: contains EOLs.}\n' +
      '{red: Notice when themes stride over}\n' +
      '{red: multiple lines.}'
    );
    expect(out).to.deep.equal([
      'BLUE:[This text]',
      'BLUE:[contains EOLs.]',
      'RED:[Notice when themes stride over]',
      'RED:[multiple lines.]',
    ]);
  });
});

