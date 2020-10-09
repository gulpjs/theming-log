# [theming-log][repo-url] [![NPM version][npm-img]][npm-url] [![MIT License][mit-img]][mit-url] [![Build Status][travis-img]][travis-url] [![Build Status][appveyor-img]][appveyor-url] [![Coverage Status][coverage-img]][coverage-url]

Creates a logger with theme for text decorations.

## Install

To install from npm:

```sh
$ npm install --save theming-log
```

## Usage

For Node.js:

```js
const themingLog = require('theming-log');
const ansiColors = require('ansi-colors'); // Use ansi-colors for coloring in this example.

const emojiCry = String.fromCodePoint(0x1f622);

const theme = {
  ERROR: '{red: {1}}',  
  red: ansiColors.red,
  emoji: {
    Cry: () => emojiCry,
  }
};

const log = themingLog(theme);

log('{emoji.Cry} This is {ERROR: an error message: {1: error code} }.', 'E001');
// => '😢 This is \u001b[31man error message: E001\u001b[39m.'

var str = themingLog.format('{emoji.Cry} This is {ERROR: an error message: {1: error code} }.', 'E001');
// str === '😢 This is \u001b[31man error message: E001\u001b[39m.'
```

For Web browsers:

```html
<script src="theming-log.min.js"></script>
<script>
function setMessage(msg) {
  document.getElementById('divMessage').innerHTML += msg + '<br/>';
}

const theme = {
  ERROR: '{red: {1}}',
  red: msg => '<span style="color:red">' + msg + '</span>',
  Cry: () => String.fromCodePoint(0x1f622),
};

const log = themingLog(theme, setMessage);

window.addEventListener('load', () => {
  log('{Cry} This is {ERROR: an error message: {1: error code} }.', 'E001');
  // => '😢 This is <span style="color:red">an error message: E001</span>.'

  var str = themingLog.format('{Cry} This is {ERROR: an error message: {1: error code} }.', 'E001');
  // str === '😢 This is <span style="color:red">an error message: E001</span>.'
});
</script>
```


## API

### <u>themingLog(theme [, logger] [, lineSep]) : function</u>

Creates a logging function based on `console.log` or a specified logging function. This created logging function converts a template text which contains style blocks (for example, `'{MSG: a message.}'`) to a decorated text.

The *theme* is an plain object which maps pairs of a style name (`'MSG'` in the above example) and either a style function or a template text.
A style function receives a block content (`'a message'` in the above example) and returns a converted text.
If a block content is a template text, it is parsed and converted with theme equally.

If the 2nd or 3rd argument is boolean, it is set to *lineSep*.
If *lineSep* is true, the created logging function split a converted text into multiple lines with newline codes and output them line by line.

**Parameters:**

| Parameter   |   Type   | Description                                            |
|:------------|:--------:|:-------------------------------------------------------|
| *theme*     | object   | An object which is a map of style names and either style functions or template texts. |
| *logger*    | function | A logging function which is based on by a created logging function. (Optional, and `console.log` in default.) |
| *lineSep*   | boolean  | If true, A logging function split a converted text into multiple lines with newline codes and output them line by line. |

**Returns:**

A logging function with theme for text decorations.

The API of a returned function is as follows:

* ***log*** **(template [, ...args]) : Void**

    | Parameters |  Type  | Description                        |
    |:-----------|:------:|:-----------------------------------|
    | *template* | string | A template text (explained [above](#template)) |
    | *args*     | *any*  | Style blocks for arguments (explained [above](#argument)) |

<a name="template"></a>

#### Format of a template text  

A template text can contain style blocks in itself.
A style block is rounded by `{` and `}`, and this can has a pair of a style name and a block content which are separated by a colon `:`.
If there is no colon in a style block, the whole text in the block is operated as a style name.

* `'{ xxxx: yyyy }'` → the style name is `'xxxx'` and the block content is `'yyyy'`.
* `'{ xxxx }'` → the style name is `'xxxx'` and the block content is `''`.
* `'{ xxxx : }'` → the style name is `'xxxx'` and the block content is `''`.
* `'{ : yyyy }'` → `'yyyy'` is operated as a text, not a block content.

Texts in a style block, both a style name and a block content, are trimmed white spaces on both sides.
Regarding a block content, the escape mark `\` can prevent trimming.
Also, this mark can escape `{` and `}`.

* `'{ xxx: \\ yyy\\  }'` → theme name is `'xxx'` and block content is `' yyy '`.
* `'\\{ xxx: yyy \\}'` → a text `'{ xxx: yyy }'`, not a style block.


***NOTICE:*** *Both a function created by <b>themingLog</b> and <b>themingLog.format</b> use `\` as an escape mark, therefore `\` in a template text are erased.
So you need to take care of `\` marks, especially path separators on Windows.*

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

<a name="argument"></a>

##### Style block for argument

A logging function can take multiple arguments.
A style block to be converted to an argument is same format with a normal style block but its style name is a number starting from 1, which indicates the index of the argument, like `{2}` or `{2: Explanatory text }`. A block content in a style block for an argument is never used, so it can be used as an explanatory text.

* `{ 1 }` → replaced with the second argument (the first argument except the template text) of logging function, or an empty string if the second argument is not given.
* `{ 3 : yyyy }` → replaced with the fourth argument (the third argument except the template text) of logging function, or an empty string if the fourth argument is not given. (`'yyyy'` is never used.)


### <u>themingLog.format(theme, template [, ...args]) : string</u>

Parses *template* text and converts it to a decorated string with *theme* and *args*. 

**Parameters:**

| Parameter   |   Type   | Description                                            |
|:------------|:--------:|:-------------------------------------------------------|
| *theme*     | object   | An object which is a map of style names and either style functions or template texts. |
| *template*  | string   | A template text (explained [above](#template)) |
| *args*      | *any*    | Style blocks for arguments (explained [above](#argument)) |

**Returns:**

A converted string.


### <u>themingLog.formatLines(theme, template [, ...args]) : Array</u>

Parses *template* text, converts it to a decorated string with *theme* and *args*, and splits the decorated string to multiple lines with newline codes. 

**Parameters:**

| Parameter   |   Type   | Description                                            |
|:------------|:--------:|:-------------------------------------------------------|
| *theme*     | object   | An object which is a map of style names and either style functions or template texts. |
| *template*  | string   | A template text (explained [above](#template)) |
| *args*      | *any*    | Style blocks for arguments (explained [above](#argument)) |

**Returns:**

An array of converted string splitted by newline codes.


## License

Copyright (C) 2018-2020 Gulp Team.

This program is free software under [MIT][mit-url] License.
See the file LICENSE in this distribution for more details.


[repo-url]: https://github.com/gulpjs/theming-log/
[npm-img]: https://img.shields.io/badge/npm-v2.1.1-blue.svg
[npm-url]: https://www.npmjs.org/package/theming-log/
[mit-img]: https://img.shields.io/badge/license-MIT-green.svg
[mit-url]: https://opensource.org/licenses.MIT
[travis-img]: https://travis-ci.org/gulpjs/theming-log.svg?branch=master
[travis-url]: https://travis-ci.org/gulpjs/theming-log
[appveyor-img]: https://ci.appveyor.com/api/projects/status/github/gulpjs/theming-log?branch=master&svg=true
[appveyor-url]: https://ci.appveyor.com/project/gulpjs/theming-log
[coverage-img]: https://coveralls.io/repos/github/gulpjs/theming-log/badge.svg
[coverage-url]: https://coveralls.io/github/gulpjs/theming-log?branch=master
