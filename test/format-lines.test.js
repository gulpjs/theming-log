'use strict';

/* eslint brace-style: off */

var expect = require('expect');
var themingLog = require('..');

var formatLines = themingLog.formatLines;

describe('formatLines', function () {
  var theme = {
    red: function (v) {
      return 'RED:[' + v + ']';
    },
    blue: function (v) {
      return 'BLUE:[' + v + ']';
    },
  };

  it('Format text without eol', function (done) {
    var out = formatLines(theme, '{red: This text contains no eol}');
    expect(out).toEqual(['RED:[This text contains no eol]']);
    done();
  });

  it('Format text with eol', function (done) {
    var out = formatLines(
      theme,
      '{blue: This text }\n' +
        '{blue: contains EOLs.}\n' +
        '{red: Notice when themes stride over}\n' +
        '{red: multiple lines.}'
    );
    expect(out).toEqual([
      'BLUE:[This text]',
      'BLUE:[contains EOLs.]',
      'RED:[Notice when themes stride over]',
      'RED:[multiple lines.]',
    ]);
    done();
  });
});
