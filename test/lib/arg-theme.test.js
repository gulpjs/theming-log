'use strict';

var chai = require('chai');
var expect = chai.expect;

var argTheme = require('../../lib/arg-theme');

describe('lib/arg-theme', function() {

  it('Should check if a theme name is an argument identifier', function() {
    expect(argTheme.is('1')).to.equal(true);
    expect(argTheme.is('2')).to.equal(true);
    expect(argTheme.is('10')).to.equal(true);
    expect(argTheme.is('21')).to.equal(true);

    expect(argTheme.is('0')).to.equal(false);
    expect(argTheme.is('-1')).to.equal(false);
    expect(argTheme.is('1a')).to.equal(false);
    expect(argTheme.is('3.')).to.equal(false);
    expect(argTheme.is('3_')).to.equal(false);
  });

  it('Should convert an arg identifier to an argument value', function() {
    var args = ['Arg0', 'Arg1', 'Arg2', 'Arg3'];
    expect(argTheme.convert(args, '-1', 'X1-')).to.equal('');
    expect(argTheme.convert(args, '0', 'X0')).to.equal('');
    expect(argTheme.convert(args, '1', 'X1')).to.equal('Arg1');
    expect(argTheme.convert(args, '2', 'X2')).to.equal('Arg2');
    expect(argTheme.convert(args, '3', 'X3')).to.equal('Arg3');
    expect(argTheme.convert(args, '4', 'X4')).to.equal('');

    expect(argTheme.convert(args, '', 'X')).to.equal('');
    expect(argTheme.convert(args, 'a', 'X')).to.equal('');
  });

});
