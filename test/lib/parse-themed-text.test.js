'use strict';

var expect = require('expect');

var parse = require('../../lib/parse-themed-text');

describe('lib/parse-themed-text', function () {
  it('Should parse a text which contains no theme block', function (done) {
    var text = 'This text contains no theme block.';
    expect(parse(text)).toEqual({ nodes: [text] });
    done();
  });

  it('Should parse a text which contains one theme block', function (done) {
    var text = 'This text contains {HIGHLIGHT: one theme} block.';
    expect(parse(text)).toEqual({
      nodes: [
        'This text contains ',
        { text: 'one theme', theme: 'HIGHLIGHT' },
        ' block.',
      ],
    });
    done();
  });

  it('Should parse a text which contains multiple theme block', function (done) {
    var text =
      'This {BOLD: text} contains {UNDERLINE: multiple} ' +
      '{ITALIC: theme block}.';

    expect(parse(text)).toEqual({
      nodes: [
        'This ',
        { text: 'text', theme: 'BOLD' },
        ' contains ',
        { text: 'multiple', theme: 'UNDERLINE' },
        ' ',
        { text: 'theme block', theme: 'ITALIC' },
        '.',
      ],
    });
    done();
  });

  it('Should parse a text which contains nested theme block', function (done) {
    var text = 'This text contains {BOLD: nested {ITALIC: theme} block}';

    expect(parse(text)).toEqual({
      nodes: [
        'This text contains ',
        {
          theme: 'BOLD',
          nodes: ['nested ', { theme: 'ITALIC', text: 'theme' }, ' block'],
        },
      ],
    });
    done();
  });

  it('Should parse an empty text', function (done) {
    expect(parse('')).toEqual({ nodes: [''] });
    done();
  });

  it('Should ignore opening bracket after escape mark (`\\`).', function (done) {
    var text = 'This text has a \\{AAA: escaped opening bracket';

    expect(parse(text)).toEqual({
      nodes: ['This text has a {AAA: escaped opening bracket'],
    });

    text = 'This text has a \\{AAA: {BOLD: escaped } opening bracket';

    expect(parse(text)).toEqual({
      nodes: [
        'This text has a {AAA: ',
        { theme: 'BOLD', text: 'escaped' },
        ' opening bracket',
      ],
    });
    done();
  });

  it('Should ignore closing bracket after escape mark (`\\`).', function (done) {
    var text = 'This text\\} has a {AAA: escaped \\} closing bracket}';

    expect(parse(text)).toEqual({
      nodes: [
        'This text} has a ',
        { theme: 'AAA', text: 'escaped } closing bracket' },
      ],
    });
    done();
  });

  it('Should ignore unescaped and no pair closing bracket', function (done) {
    var text = 'This text has unescaped } closing brackets}';

    expect(parse(text)).toEqual({
      nodes: ['This text has unescaped } closing brackets}'],
    });
    done();
  });

  it('Should ignore escape mark after escape mark (`\\`).', function (done) {
    var text = 'This \\\\text\\ contains \\\\\\escape\\\\\\\\ marks';
    expect(parse(text)).toEqual({
      nodes: ['This \\text contains \\escape\\\\ marks'],
    });
    done();
  });

  it('Should end normally when ending with escape mark.', function (done) {
    var text = 'This \\\\text\\ contains \\\\\\escape\\\\\\\\ marks\\';
    expect(parse(text)).toEqual({
      nodes: ['This \\text contains \\escape\\\\ marks'],
    });
    done();
  });

  it('Should end normally when the first node is a theme block', function (done) {
    var text = '{HIGHLIGHT: This text } starts with a theme block';
    expect(parse(text)).toEqual({
      nodes: [
        { theme: 'HIGHLIGHT', text: 'This text' },
        ' starts with a theme block',
      ],
    });
    done();
  });

  it('Should end normally when the last node is a theme block', function (done) {
    var text = 'This text ends with {ITALIC: a theme block}';
    expect(parse(text)).toEqual({
      nodes: [
        'This text ends with ',
        { theme: 'ITALIC', text: 'a theme block' },
      ],
    });
    done();
  });

  it('Should parse normally when the whole text is a theme block', function (done) {
    var text = '{AAA: This text all is in a theme block}';

    expect(parse(text)).toEqual({
      nodes: [{ theme: 'AAA', text: 'This text all is in a theme block' }],
    });
    done();
  });

  it('Should treat as a theme block of which value is empty when a theme block has no colon', function (done) {
    var text = 'This text has a theme block which has {no name}.';

    expect(parse(text)).toEqual({
      nodes: [
        'This text has a theme block which has ',
        { theme: 'no name', text: '' },
        '.',
      ],
    });
    done();
  });

  it('Should treat unclosed theme block as theme name', function (done) {
    var text = 'This text has {ERROR: a theme block which is {unclosed.';

    expect(parse(text)).toEqual({
      nodes: [
        'This text has ',
        {
          theme: 'ERROR',
          nodes: ['a theme block which is ', { theme: 'unclosed.', text: '' }],
        },
      ],
    });
    done();
  });

  it('Should treat as a text node when a theme block has an empty theme name', function (done) {
    var text = 'This text has a theme block of which {: name} is empty.';

    expect(parse(text)).toEqual({
      nodes: ['This text has a theme block of which ', 'name', ' is empty.'],
    });
    done();
  });

  it('Should get theme block normaly even when block text is empty', function (done) {
    var text = 'This text has a theme block of which {TT: } text is empty.';

    expect(parse(text)).toEqual({
      nodes: [
        'This text has a theme block of which ',
        { theme: 'TT', text: '' },
        ' text is empty.',
      ],
    });
    done();
  });

  it('Should ignore when block theme and block text are both empty', function (done) {
    var text = 'This text has a theme block of which { : } text is empty.';

    expect(parse(text)).toEqual({
      nodes: ['This text has a theme block of which ', ' text is empty.'],
    });
    done();
  });

  it('Should trim white spaces in a theme block text', function (done) {
    var text =
      'This text has a theme block which has trimmed ' +
      '{UNDERLINE:   white spaces     }.';

    expect(parse(text)).toEqual({
      nodes: [
        'This text has a theme block which has trimmed ',
        { text: 'white spaces', theme: 'UNDERLINE' },
        '.',
      ],
    });
    done();
  });

  it('Should not trim the next white space of a escape mark (`\\`) in a theme block text', function (done) {
    var text =
      'This text has a theme block which has ' +
      '{UNDERLINE: \\  white spaces  \\   }.';

    expect(parse(text)).toEqual({
      nodes: [
        'This text has a theme block which has ',
        { text: '  white spaces   ', theme: 'UNDERLINE' },
        '.',
      ],
    });
    done();
  });
});
