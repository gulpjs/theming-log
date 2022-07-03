'use strict';

var chai = require('chai');
var expect = chai.expect;

var isString = require('../../lib/is-string');

describe('is-string', function() {

  it('Should return true when value is a string', function(done) {
    expect(isString('')).to.equal(true);
    expect(isString('abc')).to.equal(true);
    expect(isString('あ')).to.equal(true);
    expect(isString('ä')).to.equal(true);
    expect(isString(String(123))).to.equal(true);
    done();
  });

  it('Should return true when value is a string object', function(done) {
    expect(isString(Object(''))).to.equal(true);
    expect(isString(new String('abc'))).to.equal(true);
    done();
  });

  it('Should return false when value is other type', function(done) {
    expect(isString(undefined)).to.equal(false);
    expect(isString(null)).to.equal(false);
    expect(isString(true)).to.equal(false);
    expect(isString(false)).to.equal(false);
    expect(isString(0)).to.equal(false);
    expect(isString(987)).to.equal(false);
    expect(isString(-0.1234)).to.equal(false);
    expect(isString(NaN)).to.equal(false);
    expect(isString(Infinity)).to.equal(false);
    expect(isString(new Number(987))).to.equal(false);
    expect(isString([])).to.equal(false);
    expect(isString([1, 2])).to.equal(false);
    expect(isString({})).to.equal(false);
    expect(isString({ a: 1 })).to.equal(false);
    expect(isString(/a/g)).to.equal(false);
    expect(isString(new RegExp('a', 'g'))).to.equal(false);
    expect(isString(function() {})).to.equal(false);
    expect(isString(new Date())).to.equal(false);
    expect(isString(new Error())).to.equal(false);

    if (typeof Symbol === 'function') {
      expect(isString(Symbol('foo'))).to.equal(false);
    }
    done();
  });
});
