'use strict';

/* eslint brace-style: off */

var chai = require('chai');
var expect = chai.expect;
var themingLog = require('..');

var format = themingLog.format;

describe('format', function() {

  describe('Format text with decorations by themes', function() {

    var themes = {
      red: function(v) { return 'Red:[' + v + ']'; },
      blue: function(v) { return 'Blue:[' + v + ']'; },
      yellow: function(v) { return 'Yellow:[' + v + ']'; },
      bold: function(v) { return 'Bold:[' + v + ']'; },
      italic: function(v) { return 'Italic:[' + v + ']'; },
      grinning: function() { return ':smile:'; },

      INFO: null,
      WARNING: 'yellow',
      ERROR: 'red',
      HIGHLIGHT: 'bold',

      TypeError: 'error',
      AppError: function(v) { return 'Magenta:[' + v + ']'; },
    };

    it('Should format no themed text', function() {
      var out = format(themes, 'This text contains no theme');
      expect(out).to.equal('This text contains no theme');
    });

    it('Should format text using theme', function() {
      var out = format(themes,
        'This {bold: text} contains {red: themed { italic : message }}.');
      expect(out).to.equal('This Bold:[text] contains Red:[themed ' +
        'Italic:[message]].');
    });

    it('Should replace arg-themes to argument values', function() {
      var out = format(themes,
        'This text has arg-theme: {2} and {1: One}', 'Arg1', 'Arg2');
      expect(out).to.equal('This text has arg-theme: Arg2 and Arg1');
    });
  });

});
