'use strict';

var expect = require('expect');

var argTheme = require('../../lib/arg-theme');

describe('lib/arg-theme', function() {

  it('Should check if a theme name is an argument identifier', function(done) {
    expect(argTheme.is('1')).toEqual(true);
    expect(argTheme.is('2')).toEqual(true);
    expect(argTheme.is('10')).toEqual(true);
    expect(argTheme.is('21')).toEqual(true);

    expect(argTheme.is('0')).toEqual(false);
    expect(argTheme.is('-1')).toEqual(false);
    expect(argTheme.is('1a')).toEqual(false);
    expect(argTheme.is('3.')).toEqual(false);
    expect(argTheme.is('3_')).toEqual(false);

    done();
  });

  it('Should convert an arg identifier to an argument value', function(done) {
    var args = ['Arg0', 'Arg1', 'Arg2', 'Arg3'];
    expect(argTheme.convert(args, '-1', 'X1-')).toEqual('');
    expect(argTheme.convert(args, '0', 'X0')).toEqual('');
    expect(argTheme.convert(args, '1', 'X1')).toEqual('Arg1');
    expect(argTheme.convert(args, '2', 'X2')).toEqual('Arg2');
    expect(argTheme.convert(args, '3', 'X3')).toEqual('Arg3');
    expect(argTheme.convert(args, '4', 'X4')).toEqual('');

    expect(argTheme.convert(args, '', 'X')).toEqual('');
    expect(argTheme.convert(args, 'a', 'X')).toEqual('');

    done();
  });

});
