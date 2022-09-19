'use strict';

var expect = require('expect');

var trim = require('../../lib/trim-unescaped-spaces');

describe('lib/trim-unescaped-spaces', function() {

  it('Should not trim when both sides are not spaces', function(done) {
    expect(trim('')).toEqual('');
    expect(trim('abc')).toEqual('abc');
    done();
  });

  it('Should trim spaces on both sides', function(done) {
    expect(trim(' ')).toEqual('');
    expect(trim(' abc ')).toEqual('abc');
    expect(trim('   abc')).toEqual('abc');
    expect(trim('abc  ')).toEqual('abc');
    expect(trim(' \n\t  abc \r\n  ')).toEqual('abc');
    done();
  });

  it('Should not trim a escaped space on left side', function(done) {
    expect(trim('  \\  abc  ')).toEqual('  abc');
    expect(trim('\\  abc  ')).toEqual('  abc');
    expect(trim(' \\\t  abc  ')).toEqual('\t  abc');
    expect(trim(' \\ \\ abc  ')).toEqual(' \\ abc');
    done();
  });

  it('Should not trim a escaped space on right side', function(done) {
    expect(trim('  abc \\   ')).toEqual('abc  ');
    expect(trim('  abc \\ ')).toEqual('abc  ');
    expect(trim('  abc \\')).toEqual('abc \\');
    done();
  });

  it('Should not trim a escaped space on both sides', function(done) {
    expect(trim(' \\ \\ ')).toEqual('  ');
    expect(trim(' \\ abc  \\ ')).toEqual(' abc   ');
    done();
  });
});
