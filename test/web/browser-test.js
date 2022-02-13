(function(){
'use strict';

/* eslint brace-style: off */


var expect = chai.expect;


var formatLines = themingLog.formatLines;

describe('formatLines', function() {

  var theme = {
    red: function(v) { return 'RED:[' + v + ']'; },
    blue: function(v) { return 'BLUE:[' + v + ']'; },
  };

  it('Format text without eol', function(done) {
    var out = formatLines(theme, '{red: This text contains no eol}');
    expect(out).to.deep.equal([
      'RED:[This text contains no eol]',
    ]);
    done();
  });

  it('Format text with eol', function(done) {
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
    done();
  });
});


})();
(function(){
'use strict';

/* eslint brace-style: off */


var expect = chai.expect;


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

    it('Should format no themed text', function(done) {
      var out = format(themes, 'This text contains no theme');
      expect(out).to.equal('This text contains no theme');
      done();
    });

    it('Should format text using theme', function(done) {
      var out = format(themes,
        'This {bold: text} contains {red: themed { italic : message }}.');
      expect(out).to.equal('This Bold:[text] contains Red:[themed ' +
        'Italic:[message]].');
      done();
    });

    it('Should replace arg-themes to argument values', function(done) {
      var out = format(themes,
        'This text has arg-theme: {2} and {1: One}', 'Arg1', 'Arg2');
      expect(out).to.equal('This text has arg-theme: Arg2 and Arg1');
      done();
    });
  });

});

})();
(function(){
'use strict';

/* eslint brace-style: off */


var expect = chai.expect;



describe('theming-log', function() {

  describe('Specify logger', function() {
    it('Should output texts to console.log', function(done) {
      var logBak = console.log;
      var logBuf = '';
      console.log = function() {
        logBuf += Array.prototype.join.call(arguments, ' ');
      };

      var logger = themingLog({});
      logger('Hello, ');
      logger('world!');

      console.log = logBak;
      expect(logBuf).to.equal('Hello, world!');
      done();
    });

    it('Should output texts to specified logger', function(done) {
      var logBuf = '';
      function origLogger() {
        logBuf += Array.prototype.join.call(arguments, ' ');
      }

      var logger = themingLog({}, origLogger);
      logger('Hello, ');
      logger('world!');
      expect(logBuf).to.equal('Hello, world!');
      done();
    });
  });

  describe('Output log with decorations by themes', function() {
    var logBuf = '';
    function origLogger() {
      logBuf += Array.prototype.join.call(arguments, ' ') + '\n';
    }

    var themes = {
      red: function(v) { return 'Red:[' + v + ']'; },
      blue: function(v) { return 'Blue:[' + v + ']'; },
      yellow: function(v) { return 'Yellow:[' + v + ']'; },
      bold: function(v) { return 'Bold:[' + v + ']'; },
      italic: function(v) { return 'Italic:[' + v + ']'; },
      grinning: function() { return ':smile:'; },

      INFO: null,
      WARNING: '{yellow: {1}}',
      ERROR: '{red: {1}}',
      HIGHLIGHT: '{bold: {1}}',

      TypeError: '{error: {1}}',
      AppError: function(v) { return 'Magenta:[' + v + ']'; },
    };

    beforeEach(function(done) {
      logBuf = '';
      done();
    });

    it('Should output no themed text', function(done) {
      var log = themingLog(themes, origLogger);
      log('This text contains no theme');
      expect(logBuf).to.equal('This text contains no theme\n');
      done();
    });

    it('Should output text using theme', function(done) {
      var log = themingLog(themes, origLogger);
      log('This {bold: text} contains {red: themed { italic : message }}.');
      expect(logBuf).to.equal('This Bold:[text] contains Red:[themed ' +
        'Italic:[message]].\n');
      done();
    });

    it('Should output text using theme of reference name', function(done) {
      var log = themingLog(themes, origLogger);
      log('{INFO: This text contains {HIGHLIGHT: theme of reference name}}.');
      expect(logBuf).to.equal('This text contains Bold:[theme of reference ' +
        'name].\n');
      done();
    });

    it('Should treat unclosed theme as theme name', function(done) {
      var log = themingLog(themes, origLogger);
      log('This text is {grinning');
      expect(logBuf).to.equal('This text is :smile:\n');
      done();
    });

    it('Should output normally when a theme value function is no arg', function(done) {
      var log = themingLog(themes, origLogger);
      log('{grinning} This is {ERROR: an error message}.');
      expect(logBuf).to.equal(
        ':smile: This is Red:[an error message].\n');
      done();
    });

    it('Should not trim escaped spaces in theme block', function(done) {
      var log = themingLog(themes, origLogger);
      log('This text is {red:    caution      }.');
      log('This text is {red: \\  caution  \\   }.');
      expect(logBuf).to.equal(
        'This text is Red:[caution].\n' +
        'This text is Red:[  caution   ].\n' +
      '');
      done();
    });

    it('Should ignore escaped brackets', function(done) {
      var log = themingLog(themes, origLogger);
      log('This \\{yellow text {blue: has \\} escaped theme} blocks\\}');
      expect(logBuf).to.equal(
        'This {yellow text Blue:[has } escaped theme] blocks}\n'
      );
      done();
    });

    it('Should ignore escape mark at last position', function(done) {
      var log = themingLog(themes, origLogger);
      log('This text ends with escape mark\\');
      expect(logBuf).to.equal(
        'This text ends with escape mark\n'
      );
      done();
    });

    it('Should ignore a theme block of which name and value are both empty', function(done) {
      var log = themingLog(themes, origLogger);
      log('This text has { : }empty theme block');
      expect(logBuf).to.equal(
        'This text has empty theme block\n'
      );
      done();
    });

    it('Should treat a theme block of which name is empty as a text', function(done) {
      var log = themingLog(themes, origLogger);
      log('This text has an { : empty name } theme block');
      expect(logBuf).to.equal(
        'This text has an empty name theme block\n'
      );
      done();
    });

    it('Should return an empty string when arg is null', function(done) {
      var log = themingLog(themes, origLogger);
      log(null);
      expect(logBuf).to.equal('\n');
      done();
    });

    it('Should return an empty string when arg is empty', function(done) {
      var log = themingLog(themes, origLogger);
      log('');
      expect(logBuf).to.equal('\n');
      done();
    });

    it('Should return an empty string when arg is not a string', function(done) {
      var log = themingLog(themes, origLogger);
      log(true);
      expect(logBuf).to.equal('\n');

      log(false);
      expect(logBuf).to.equal('\n\n');

      log(0);
      expect(logBuf).to.equal('\n\n\n');

      log(123);
      expect(logBuf).to.equal('\n\n\n\n');

      log([]);
      expect(logBuf).to.equal('\n\n\n\n\n');

      log({});
      expect(logBuf).to.equal('\n\n\n\n\n\n');

      done();
    });

    describe('Theme for arguments', function() {
      it('Should replace arg-themes to argument values', function(done) {
        var log = themingLog(themes, origLogger);
        log('This text has arg-theme: {2} and {1: One}', 'Arg1', 'Arg2');
        expect(logBuf).to.equal('This text has arg-theme: Arg2 and Arg1\n');
        done();
      });

      it('Should replace arg-themes to an empty string when corresponding arg are not exist', function(done) {
        var log = themingLog(themes, origLogger);
        log('This text has arg-theme: {5} and {3: Three}', 'Arg1', 'Arg2');
        expect(logBuf).to.equal('This text has arg-theme:  and \n');
        done();
      });

      it('Should replace arg-theme in nested theme', function(done) {
        var log = themingLog(themes, origLogger);
        var text = 'This text is { ERROR: a error message: ' +
          '{1: error code } }.';
        log(text, 'E01');
        expect(logBuf).to.equal('This text is Red:[a error message: E01].\n');
        done();
      });
    });
  });

  describe('Support to output multiple line logs', function() {

    var theme = {
      red: function(v) {
        return 'RED:[' + v + ']';
      },
    };

    var logBuf;
    function origLogger() {
      logBuf.push(Array.prototype.join.call(arguments, ' '));
    }

    beforeEach(function(done) {
      logBuf = [];
      done();
    });

    it('Should output multiple logs by line when containing EOLs', function(done) {
      var log = themingLog(theme, origLogger, true);
      log('{red: First line.}\n{red: Second line.}\n{red: Third line.}');
      expect(logBuf).to.deep.equal([
        'RED:[First line.]',
        'RED:[Second line.]',
        'RED:[Third line.]',
      ]);
      done();
    });

    it('Should output single log when containing no EOLs', function(done) {
      var log = themingLog(theme, origLogger, true);
      log('{red: First line.}');
      expect(logBuf).to.deep.equal([
        'RED:[First line.]',
      ]);
      done();
    });

    it('Should output an empty log when a template is empty', function(done) {
      var log = themingLog(theme, origLogger, true);
      log('');
      log(null);
      log();
      expect(logBuf).to.deep.equal(['', '', '']);
      done();
    });

    it('Should output single log when `lineSep` flag is false', function(done) {
      var log = themingLog(theme, origLogger, false);
      log('{red: First line.}\n{red: Second line.}\n{red: Third line.}');
      expect(logBuf).to.deep.equal([
        'RED:[First line.]\nRED:[Second line.]\nRED:[Third line.]',
      ]);
      done();
    });

    it('Should output multiple lines to console.log when 2nd arg is true', function(done) {
      var logBuf = [];
      var logBak = console.log;
      console.log = function() {
        logBuf.push(Array.prototype.join.call(arguments, ' '));
      };
      var log = themingLog(theme, true);

      log('aaa\nbbb\r\nccc\rddd');
      expect(logBuf).to.deep.equal(['aaa', 'bbb', 'ccc', 'ddd']);

      console.log = logBak;
      done();
    });
  });
});

})();
