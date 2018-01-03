'use strict';

var chai = require('chai');
var expect = chai.expect;
var apply = require('../../lib/apply-theme');

var themeSet = {
  ERROR: function(v) {
    return 'E:[' + v + ']';
  },
  WARN: function(v) {
    return 'W:[' + v + ']';
  },
  HIGHLIGHT: function(v) {
    return 'H:[' + v + ']';
  },
  TypeError: 'ERROR',
  Emphasis: 'HIGHLIGHT',
  BadTheme: 'bad theme',
};

describe('lib/apply-theme', function() {

  it('Should apply theme to a text', function() {
    var parsed = { nodes: [
      { theme: 'ERROR', text: 'This is an error message.' },
    ] };
    expect(apply(parsed, themeSet)).to.equal('E:[This is an error message.]');
  });

  it('Should apply theme to multiple texts', function() {
    var parsed = { nodes: [
      { theme: 'ERROR', text: 'This is an error message.' },
      { theme: 'WARN', text: 'This is a warning message.' },
    ] };
    expect(apply(parsed, themeSet)).to.equal(
      'E:[This is an error message.]W:[This is a warning message.]');
  });

  it('Should apply theme to only themed texts', function() {
    var parsed = { nodes: [
      { theme: 'ERROR', text: 'This is an error message.' },
      'This is not themed text.',
      { theme: 'ERROR', text: 'This is an error message, too.' },
      'This is not themed text, too.',
      { theme: 'WARN', text: 'This is a warning message.' },
    ] };
    expect(apply(parsed, themeSet)).to.equal(
      'E:[This is an error message.]' +
      'This is not themed text.' +
      'E:[This is an error message, too.]' +
      'This is not themed text, too.' +
      'W:[This is a warning message.]'
    );
  } );

  it('Should apply theme to nested themed texts', function() {
    var parsed = { nodes: [
      'aaa ',
      { theme: 'ERROR', nodes: [
        'bbb ',
        { theme: 'HIGHLIGHT', nodes: 'ccc' },
        ' ddd ',
        { theme: 'WARN', nodes: [
          'eee ',
          { theme: 'HIGHLIGHT', text: 'fff' },
          ' ggg',
        ] },
        ' hhh'
      ] },
      ' iii',
    ] };

    expect(apply(parsed, themeSet)).to.equal(
      'aaa E:[bbb H:[ccc] ddd W:[eee H:[fff] ggg] hhh] iii');
  });

  it('Should apply theme of which value is theme name', function() {
    var parsed = { nodes: [
      { theme: 'TypeError', text: 'type error' },
      ' / ',
      { theme: 'Emphasis', nodes: [
        'emphasized ',
        { theme: 'TypeError',  text: 'type error' },
      ] },
      '.',
    ] };

    expect(apply(parsed, themeSet)).to.equal(
      'E:[type error] / H:[emphasized E:[type error]].');
  });

  it('Should apply nothing when specified name is not found in theme',
  function() {
    var parsed = { nodes: [
      { theme: 'NoTheme', text: 'no theme' },
      ' / ',
      { theme: 'Emphasis', nodes: [
        'emphasized ',
        { theme: 'BadTheme',  text: 'message' },
      ] },
      '.',
    ] };

    expect(apply(parsed, themeSet)).to.equal(
      'no theme / H:[emphasized message].');
  });

  it('Should end normally when argument is empty', function() {
    var parsed = { nodes: [] };
    expect(apply(parsed, themeSet)).to.equal('');

    parsed = { nodes: [''] };
    expect(apply(parsed, themeSet)).to.equal('');

    parsed = { nodes: ['', ''] };
    expect(apply(parsed, themeSet)).to.equal('');

    parsed = { nodes: [{ theme: 'ERROR', text: '' }] };
    expect(apply(parsed, themeSet)).to.equal('E:[]');

    parsed = { nodes: [{ theme: 'ERROR', nodes: [] }] };
    expect(apply(parsed, themeSet)).to.equal('E:[]');

    parsed = { nodes: [{ theme: 'ERROR', nodes: [''] }] };
    expect(apply(parsed, themeSet)).to.equal('E:[]');
  });
});
