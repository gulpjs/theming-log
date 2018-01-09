'use strict';

var chai = require('chai');
var expect = chai.expect;

var trim = require('../../lib/trim-unescaped-spaces');

describe('lib/trim-unescaped-spaces', function() {

  it('Should not trim when both sides are not spaces', function() {
    expect(trim('')).to.equal('');
    expect(trim('abc')).to.equal('abc');
  });

  it('Should trim spaces on both sides', function() {
    expect(trim(' ')).to.equal('');
    expect(trim(' abc ')).to.equal('abc');
    expect(trim('   abc')).to.equal('abc');
    expect(trim('abc  ')).to.equal('abc');
    expect(trim(' \n\t  abc \r\n  ')).to.equal('abc');
  });

  it('Should not trim a escaped space on left side', function() {
    expect(trim('  \\  abc  ')).to.equal('  abc');
    expect(trim('\\  abc  ')).to.equal('  abc');
    expect(trim(' \\\t  abc  ')).to.equal('\t  abc');
    expect(trim(' \\ \\ abc  ')).to.equal(' \\ abc');
  });

  it('Should not trim a escaped space on right side', function() {
    expect(trim('  abc \\   ')).to.equal('abc  ');
    expect(trim('  abc \\ ')).to.equal('abc  ');
    expect(trim('  abc \\')).to.equal('abc \\');
  });

  it('Should not trim a escaped space on both sides', function() {
    expect(trim(' \\ \\ ')).to.equal('  ');
    expect(trim(' \\ abc  \\ ')).to.equal(' abc   ');
  });
});
