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

const themes = {
  ERROR: 'red',  
  red: ansiColors.red,
  emoji: {
    Cry: () => emojiCry,
  }
};

const log = themingLog(themes);

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

const themes = {
  ERROR: 'red',
  red: msg => '<span style="color:red">' + msg + '</span>',
  Cry: () => String.fromCodePoint(0x1f622),
};

const log = themingLog(themes, setMessage);

window.addEventListener('load', () => {
  log('{Cry} This is {ERROR: an error message: {1: error code} }.', 'E001');
  // => '😢 This is <span style="color:red">an error message: E001</span>.'

  var str = themingLog.format('{emoji.Cry} This is {ERROR: an error message: {1: error code} }.', 'E001');
  // str === '😢 This is <span style="color:red">an error message: E001</span>.'
});
</script>
```


## API

### <u>themingLog(themes [, logger]) : function</u>

Creates a logging function based on `console.log` or a specified logging function.

The *themes* is an object which has mappings of theme names and theme functions which decorate a text, and the mapping values can be specified strings which are theme reference names.
If a mapping value is a theme reference name, a generated logger by this function finds another a theme mapping of which the name matches the reference name.

If there are no theme mapping in *themes*, a generated logger by this function does not decorate a text.

#### Format of a themed text

A themed text can contain theme blocks in itself.
A theme block is rounded by `{` and `}`, and this can has a theme name and a block content which are separated by a colon `:`.

If there is no colon in a theme block, the whole text in the block is treated as a theme name.

* `'{ xxxx: yyyy }'` → the theme name is `'xxxx'` and the block content is `'yyyy'`.
* `'{ xxxx }'` → the theme name is `'xxxx'` and the block content is `''`.
* `'{ xxxx : }'` → the theme name is `'xxxx'` and the block content is `''`.
* `'{ : yyyy }'` → `'yyyy'` is treated as a text, not a block content.

Texts in theme blocks are trimmed white spaces of both sides.
Regarding block content, the escape mark `\` can prevent trimming.
Also, this mark can escape `{` and `}`.

* `'{ xxx: \\  yyy \\  }'` → theme name is `'xxx'` and block content is `'  yyy '`.
* `'\\{ xxx: yyy \\}'` → a text `'{ xxx: yyy }'`, not a theme block.

##### Theme for argument

A logging function created by this function can take multiple arguments.
A themed text to be converted to an argument has same format with a normal themed text but its theme name is a number starting from 1, which indicates the index of the argument, like `{2}` or `{2: Explanatory text }`.

A block content in a theme block for argument is outputted alternatively when there is no argument corresponding to a number of a theme name.

* `{ 1 }` → replaced with the second argument (the first argument except the themed text) of logging function, or an empty string if the second argument is not given.
* `{ 3 : yyyy }` → replaced with the fourth argument (the third argument except the themed text) of logging function, or an empty string if the fourth argument is not given. (`'yyyy'` is not used.)

#### Parameters:

| Parameter   |   Type   | Description                                            |
|:------------|:--------:|:-------------------------------------------------------|
| *themes*    | object   | An object which has a set of theming text decorations. |
| *logger*    | function | A logging function which is based on by a generated logging function. (Optional, and `console.log` in default.) |

#### Returns:

A logging function with theme for text decorations.

**Type:** function


### <u>.format(themes, fmt [, ...args]) : string</u>

Returns a formatted string from *fmt* with *themes* and *args*. 

#### Parameters:

| Parameter   |   Type   | Description                                            |
|:------------|:--------:|:-------------------------------------------------------|
| *themes*    | object   | An object which has a set of theming text decorations. |
| *fmt*       | string   | a themed text (explained above)        |
| *args*      | *any*    | themes for arguments (explained above) |

#### Returns:

A formatted string.

**Type:** string


## License

Copyright (C) 2018 Takayuki Sato.

This program is free software under [MIT][mit-url] License.
See the file LICENSE in this distribution for more details.


[repo-url]: https://github.com/sttk/theming-log/
[npm-img]: https://img.shields.io/badge/npm-v1.0.0-blue.svg
[npm-url]: https://www.npmjs.org/package/theming-log/
[mit-img]: https://img.shields.io/badge/license-MIT-green.svg
[mit-url]: https://opensource.org/licenses.MIT
[travis-img]: https://travis-ci.org/sttk/theming-log.svg?branch=master
[travis-url]: https://travis-ci.org/sttk/theming-log
[appveyor-img]: https://ci.appveyor.com/api/projects/status/github/sttk/theming-log?branch=master&svg=true
[appveyor-url]: https://ci.appveyor.com/project/sttk/theming-log
[coverage-img]: https://coveralls.io/repos/github/sttk/theming-log/badge.svg
[coverage-url]: https://coveralls.io/github/sttk/theming-log?branch=master
