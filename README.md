<p align="center">
  <a href="http://gulpjs.com">
    <img height="257" width="114" src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp-2x.png">
  </a>
</p>

# theming-log

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][ci-image]][ci-url] [![Coveralls Status][coveralls-image]][coveralls-url]

Creates a logger with theme for text decorations.

## Usage

```js
const themingLog = require('theming-log');
const ansiColors = require('ansi-colors'); // Use ansi-colors for coloring in this example.

const emojiCry = String.fromCodePoint(0x1f622);

const theme = {
  ERROR: '{red: {1}}',
  red: ansiColors.red,
  emoji: {
    Cry: () => emojiCry,
  },
};

const log = themingLog(theme);

log('{emoji.Cry} This is {ERROR: an error message: {1: error code} }.', 'E001');
// => '😢 This is \u001b[31man error message: E001\u001b[39m.'

var str = themingLog.format(
  '{emoji.Cry} This is {ERROR: an error message: {1: error code} }.',
  'E001'
);
// str === '😢 This is \u001b[31man error message: E001\u001b[39m.'
```

## API

### themingLog(theme [, logger] [, lineSep]) : function

Creates a logging function based on `console.log` or a specified logging function. This created logging function converts a template text which contains style blocks (for example, `'{MSG: a message.}'`) to a decorated text.

The _theme_ is an plain object which maps pairs of a style name (`'MSG'` in the above example) and either a style function or a template text.
A style function receives a block content (`'a message'` in the above example) and returns a converted text.
If a block content is a template text, it is parsed and converted with theme equally.

If the 2nd or 3rd argument is boolean, it is set to _lineSep_.
If _lineSep_ is true, the created logging function split a converted text into multiple lines with newline codes and output them line by line.

**Parameters:**

| Parameter |   Type   | Description                                                                                                             |
| :-------- | :------: | :---------------------------------------------------------------------------------------------------------------------- |
| _theme_   |  object  | An object which is a map of style names and either style functions or template texts.                                   |
| _logger_  | function | A logging function which is based on by a created logging function. (Optional, and `console.log` in default.)           |
| _lineSep_ | boolean  | If true, A logging function split a converted text into multiple lines with newline codes and output them line by line. |

**Returns:**

A logging function with theme for text decorations.

The API of a returned function is as follows:

- **_log_** **(template [, ...args]) : Void**

  | Parameters |  Type  | Description                                               |
  | :--------- | :----: | :-------------------------------------------------------- |
  | _template_ | string | A template text (explained [above][template])             |
  | _args_     | _any_  | Style blocks for arguments (explained [above][arguments]) |

#### Format of a template text

A template text can contain style blocks in itself.
A style block is rounded by `{` and `}`, and this can has a pair of a style name and a block content which are separated by a colon `:`.
If there is no colon in a style block, the whole text in the block is operated as a style name.

- `'{ xxxx: yyyy }'` → the style name is `'xxxx'` and the block content is `'yyyy'`.
- `'{ xxxx }'` → the style name is `'xxxx'` and the block content is `''`.
- `'{ xxxx : }'` → the style name is `'xxxx'` and the block content is `''`.
- `'{ : yyyy }'` → `'yyyy'` is operated as a text, not a block content.

Texts in a style block, both a style name and a block content, are trimmed white spaces on both sides.
Regarding a block content, the escape mark `\` can prevent trimming.
Also, this mark can escape `{` and `}`.

- `'{ xxx: \\ yyy\\ }'` → theme name is `'xxx'` and block content is `' yyy '`.
- `'\\{ xxx: yyy \\}'` → a text `'{ xxx: yyy }'`, not a style block.

**_NOTICE:_** _Both a function created by **themingLog** and **themingLog.format** use `\` as an escape mark, therefore `\` in a template text are erased.
So you need to take care of `\` marks, especially path separators on Windows._

```js
var log = themingLog({}, console.log);
var format = themingLog.format;

// Erases '\\' as a escape mark.
log('C:\\\\abc\\\\def\\\\ghi');
// => console.log('C:\\abc\\def\\ghi') => C:\abc\def\ghi

// Not erases '\\' in arguments.
log('{1}', 'C:\\abc\\def\\ghi');
// => console.log('C:\\abc\\def\\ghi') => C:\abc\def\ghi

// Erases '\\' as a escape mark.
console.log(format({}, 'C:\\\\abc\\\\def\\\\ghi'));
// => console.log('C:\\abc\\def\\ghi') => C:\abc\def\ghi

// Not erases '\\' in arguments.
console.log(format({}, '{1}', 'C:\\abc\\def\\ghi'));
// => console.log('C:\\abc\\def\\ghi') => C:\abc\def\ghi

// format() and next log() erase double '\\' as escape marks
log(format({}, 'C:\\\\\\\\abc\\\\\\\\def\\\\\\\\ghi'));
// => log('C:\\\\abc\\\\def\\\\ghi') => C:\abc\def\ghi

// Only log() erases '\\' as a escape mark.
log(format({}, '{1}', 'C:\\\\abc\\\\def\\\\ghi'));
// => log('C:\\\\abc\\\\def\\\\ghi') => C:\abc\def\ghi

// Neither log() nor format() erase '\\'
log('{1}', format({}, '{1}', 'C:\\abc\\def\\ghi'));
// => log('{1]", 'C:\\abc\\def\\ghi') => C:\abc\def\ghi
```

##### Style block for argument

A logging function can take multiple arguments.
A style block to be converted to an argument is same format with a normal style block but its style name is a number starting from 1, which indicates the index of the argument, like `{2}` or `{2: Explanatory text }`. A block content in a style block for an argument is never used, so it can be used as an explanatory text.

- `{ 1 }` → replaced with the second argument (the first argument except the template text) of logging function, or an empty string if the second argument is not given.
- `{ 3 : yyyy }` → replaced with the fourth argument (the third argument except the template text) of logging function, or an empty string if the fourth argument is not given. (`'yyyy'` is never used.)

### themingLog.format(theme, template [, ...args]) : string

Parses _template_ text and converts it to a decorated string with _theme_ and _args_.

**Parameters:**

| Parameter  |  Type  | Description                                                                           |
| :--------- | :----: | :------------------------------------------------------------------------------------ |
| _theme_    | object | An object which is a map of style names and either style functions or template texts. |
| _template_ | string | A template text (explained [above][template])                                         |
| _args_     | _any_  | Style blocks for arguments (explained [above][arguments])                             |

**Returns:**

A converted string.

### themingLog.formatLines(theme, template [, ...args]) : Array

Parses _template_ text, converts it to a decorated string with _theme_ and _args_, and splits the decorated string to multiple lines with newline codes.

**Parameters:**

| Parameter  |  Type  | Description                                                                           |
| :--------- | :----: | :------------------------------------------------------------------------------------ |
| _theme_    | object | An object which is a map of style names and either style functions or template texts. |
| _template_ | string | A template text (explained [above][template])                                         |
| _args_     | _any_  | Style blocks for arguments (explained [above][arguments])                             |

**Returns:**

An array of converted string splitted by newline codes.

## License

MIT

<!-- prettier-ignore-start -->
[downloads-image]: https://img.shields.io/npm/dm/theming-log.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/theming-log
[npm-image]: https://img.shields.io/npm/v/theming-log.svg?style=flat-square

[ci-url]: https://github.com/gulpjs/theming-log/actions?query=workflow:dev
[ci-image]: https://img.shields.io/github/workflow/status/gulpjs/theming-log/dev?style=flat-square

[coveralls-url]: https://coveralls.io/r/gulpjs/theming-log
[coveralls-image]: https://img.shields.io/coveralls/gulpjs/theminglog/master.svg?style=flat-square
<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->
[template]: #format-of-a-template-text
[arguments]: #style-block-for-argument
<!-- prettier-ignore-end -->
