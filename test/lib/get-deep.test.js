'use strict';

var expect = require('expect');

var getDeep = require('../../lib/get-deep');

describe('get-deep', function() {

  it('Should get value of the specified prop path', function(done) {
    var obj = {
      a00: {
        a10: { a20: 1, a21: 2, a22: 3, },
        a11: { a20: 4, a23: 5, a24: 6, },
      },
      a01: {
        a10: { a20: 7, a21: 8, a22: 9, },
        a12: {},
      }
    };

    expect(getDeep(obj, [])).toEqual(obj);

    expect(getDeep(obj, ['a00'])).toEqual(obj.a00);
    expect(getDeep(obj, ['a01'])).toEqual(obj.a01);
    expect(getDeep(obj, ['a02'])).toEqual(obj.a02);

    expect(getDeep(obj, ['a00', 'a10'])).toEqual(obj.a00.a10);
    expect(getDeep(obj, ['a00', 'a11'])).toEqual(obj.a00.a11);
    expect(getDeep(obj, ['a01', 'a10'])).toEqual(obj.a01.a10);
    expect(getDeep(obj, ['a01', 'a12'])).toEqual(obj.a01.a12);

    expect(getDeep(obj, ['a00', 'a10', 'a20'])).toEqual(1);
    expect(getDeep(obj, ['a00', 'a10', 'a21'])).toEqual(2);
    expect(getDeep(obj, ['a00', 'a10', 'a22'])).toEqual(3);

    expect(getDeep(obj, ['a00', 'a11', 'a20'])).toEqual(4);
    expect(getDeep(obj, ['a00', 'a11', 'a23'])).toEqual(5);
    expect(getDeep(obj, ['a00', 'a11', 'a24'])).toEqual(6);

    expect(getDeep(obj, ['a01', 'a10', 'a20'])).toEqual(7);
    expect(getDeep(obj, ['a01', 'a10', 'a21'])).toEqual(8);
    expect(getDeep(obj, ['a01', 'a10', 'a22'])).toEqual(9);

    done();
  });

  it('Should get undefined when not having the specified prop path', function(done) {
    var obj = {
      a00: {
        a10: { a20: 1, a21: 2, a22: 3, },
        a11: { a20: 4, a23: 5, a24: 6, },
      },
      a01: {
        a10: { a20: 7, a21: 8, a22: 9, },
        a12: {},
      }
    };

    expect(getDeep(obj, ['a', 'b', 'c'])).toBeUndefined();
    expect(getDeep(obj, ['a00', 'b', 'c'])).toBeUndefined();
    expect(getDeep(obj, ['a00', 'a10', 'c'])).toBeUndefined();

    done();
  });

  it('Should get undefined when prop path is not an array', function(done) {
    var obj = {
      a00: {
        a10: { a20: 1, a21: 2, a22: 3, },
        a11: { a20: 4, a23: 5, a24: 6, },
      },
      a01: {
        a10: { a20: 7, a21: 8, a22: 9, },
        a12: {},
      }
    };

    expect(getDeep(obj, undefined)).toBeUndefined();
    expect(getDeep(obj, null)).toBeUndefined();
    expect(getDeep(obj, true)).toBeUndefined();
    expect(getDeep(obj, false)).toBeUndefined();
    expect(getDeep(obj, 0)).toBeUndefined();
    expect(getDeep(obj, 10)).toBeUndefined();
    expect(getDeep(obj, '')).toBeUndefined();
    expect(getDeep(obj, 'a00')).toBeUndefined();
    expect(getDeep(obj, { a00: 'a00', })).toBeUndefined();

    if (typeof Symbol === 'function') {
      expect(getDeep(obj, Symbol('a00'))).toBeUndefined();
    }

    done();
  });

  it('Should get obj itself when obj is primitive type and propPath is nullish or empty', function(done) {
    expect(getDeep(undefined)).toBeUndefined();
    expect(getDeep(null)).toBeNull();
    expect(getDeep(true)).toEqual(true);
    expect(getDeep(false)).toEqual(false);
    expect(getDeep(0)).toEqual(0);
    expect(getDeep(123)).toEqual(123);

    expect(getDeep(undefined, [])).toBeUndefined();
    expect(getDeep(null, [])).toBeNull();
    expect(getDeep(true, [])).toEqual(true);
    expect(getDeep(false, [])).toEqual(false);
    expect(getDeep(0, [])).toEqual(0);
    expect(getDeep(123, [])).toEqual(123);

    done();
  });

  it('Should get prop value even when obj is not a object', function(done) {
    expect(getDeep([1,2,3], ['length'])).toEqual(3);

    function fn(b, c) {
      return b + c;
    }
    expect(getDeep(fn['length'])).toEqual(2);

    expect(getDeep('ABC'['length'])).toEqual(3);

    expect(getDeep(undefined, ['length'])).toBeUndefined();
    expect(getDeep(null, ['length'])).toBeUndefined();
    expect(getDeep(true, ['length'])).toBeUndefined();
    expect(getDeep(false, ['length'])).toBeUndefined();
    expect(getDeep(0, ['length'])).toBeUndefined();
    expect(getDeep(123, ['length'])).toBeUndefined();

    done();
  });

  it('Should get an enumerable property key value', function(done) {
    var obj = { a: { b: { c: 123 } } };
    expect(getDeep(obj, ['a'])).toEqual(obj.a);
    expect(getDeep(obj, ['a', 'b'])).toEqual(obj.a.b);
    expect(getDeep(obj, ['a', 'b', 'c'])).toEqual(obj.a.b.c);
    expect(getDeep(obj, ['a', 'b', 'c'])).toEqual(123);

    done();
  });

  it('Should get an unenumerable property key value', function(done) {
    var obj = {};
    Object.defineProperty(obj, 'a', { value: {} });
    Object.defineProperty(obj.a, 'b', { value: {} });
    Object.defineProperty(obj.a.b, 'c', { value: 123 });

    expect(getDeep(obj, ['a'])).toEqual(obj.a);
    expect(getDeep(obj, ['a', 'b'])).toEqual(obj.a.b);
    expect(getDeep(obj, ['a', 'b', 'c'])).toEqual(obj.a.b.c);
    expect(getDeep(obj, ['a', 'b', 'c'])).toEqual(123);

    done();
  });

  it('Should get an inherited property key value', function(done) {
    var obj0 = new function() {
      this.a = {};
    };
    Object.defineProperty(obj0.a, 'b', { value: {} });

    obj0.a.b.c = 123;
    function Fn1() {};
    Fn1.prototype = obj0;
    var obj = new Fn1();

    expect(obj.a.b.c).toEqual(123);
    expect(getDeep(obj, ['a'])).toEqual(obj.a);
    expect(getDeep(obj, ['a', 'b'])).toEqual(obj.a.b);
    expect(getDeep(obj, ['a', 'b', 'c'])).toEqual(obj.a.b.c);
    expect(getDeep(obj, ['a', 'b', 'c'])).toEqual(123);

    done();
  });

  it('Should get an enumerable property symbol value', function(done) {
    if (typeof Symbol !== 'function') {
      this.skip();
      return;
    }
    var a = Symbol('a'), b = Symbol('b'), c = Symbol('c');

    var obj = {};
    obj[a] = {};
    obj[a][b] = {};
    obj[a][b][c] = 123;

    expect(getDeep(obj, [a])).toEqual(obj[a]);
    expect(getDeep(obj, [a, b])).toEqual(obj[a][b]);
    expect(getDeep(obj, [a, b, c])).toEqual(obj[a][b][c]);
    expect(getDeep(obj, [a, b, c])).toEqual(123);

    done();
  });

  it('Should get an unenumerable property symbol value', function(done) {
    if (typeof Symbol !== 'function') {
      this.skip();
      return;
    }
    var a = Symbol('a'), b = Symbol('b'), c = Symbol('c');

    var obj = {};
    Object.defineProperty(obj, a, { value: {} });
    Object.defineProperty(obj[a], b, { value: {} });
    Object.defineProperty(obj[a][b], c, { value: 123 });

    expect(getDeep(obj, [a])).toEqual(obj[a]);
    expect(getDeep(obj, [a, b])).toEqual(obj[a][b]);
    expect(getDeep(obj, [a, b, c])).toEqual(obj[a][b][c]);
    expect(getDeep(obj, [a, b, c])).toEqual(123);

    done();
  });

  it('Should get an inherited property symbol value', function(done) {
    if (typeof Symbol !== 'function') {
      this.skip();
      return;
    }
    var a = Symbol('a'), b = Symbol('b'), c = Symbol('c');

    var obj0 = new function() {
      this[a] = {};
    };
    Object.defineProperty(obj0[a], b, { value: {} });
    obj0[a][b][c] = 123;
    function Fn1() {};
    Fn1.prototype = obj0;
    var obj = new Fn1();

    expect(obj[a][b][c]).toEqual(123);
    expect(getDeep(obj, [a])).toEqual(obj[a]);
    expect(getDeep(obj, [a, b])).toEqual(obj[a][b]);
    expect(getDeep(obj, [a, b, c])).toEqual(obj[a][b][c]);
    expect(getDeep(obj, [a, b, c])).toEqual(123);

    done();
  });

  it('Should not throw an error when 2nd arg is a Symbol array', function(done) {
    if (typeof Symbol !== 'function') {
      this.skip();
      return;
    }

    var a = Symbol('a'), b = Symbol('b'), c = Symbol('c');
    var obj = {};
    obj[a] = {};
    obj[a][b] = {};
    obj[a][b][c] = 3;

    expect(getDeep(obj, [[a], b, c])).toBeUndefined();
    expect(getDeep(obj, [a, [b], c])).toBeUndefined();
    expect(getDeep(obj, [a, b, [c]])).toBeUndefined();

    done();
  });

  it('Should not allow to use an array as a property', function(done) {
    var obj = { a: 1, b: { c: 2 }, 'd,e': 3 };
    expect(getDeep(obj, ['a'])).toEqual(1);
    expect(getDeep(obj, [['a']])).toBeUndefined();
    expect(getDeep(obj, ['b', 'c'])).toEqual(2);
    expect(getDeep(obj, [['b'], 'c'])).toBeUndefined();
    expect(getDeep(obj, ['b', ['c']])).toBeUndefined();
    expect(getDeep(obj, ['d,e'])).toEqual(3);
    expect(getDeep(obj, [['d','e']])).toBeUndefined();

    if (typeof Symbol === 'function') {
      obj = {};
      var a = Symbol('a'), b = Symbol('b'), c = Symbol('c'),
          d = Symbol('d'), e = Symbol('e');
      var de = [d.toString(), e.toString()].toString();
      obj[a] = 1;
      obj[a.toString()] = 11;
      obj[b] = {};
      obj[b][c] = 2;
      obj[b][c.toString()] = 21;
      obj[b.toString()] = {};
      obj[b.toString()][c] = 22;
      obj[de] = 3;
      expect(getDeep(obj, [a])).toEqual(1);
      expect(getDeep(obj, [a.toString()])).toEqual(11);
      expect(getDeep(obj, [[a]])).toBeUndefined();
      expect(getDeep(obj, [b, c])).toEqual(2);
      expect(getDeep(obj, [b, c.toString()])).toEqual(21);
      expect(getDeep(obj, [b.toString(), c])).toEqual(22);
      expect(getDeep(obj, [[b], c])).toBeUndefined();
      expect(getDeep(obj, [b, [c]])).toBeUndefined();
      expect(getDeep(obj, [de])).toEqual(3);
      expect(getDeep(obj, [[d,e]])).toBeUndefined();
    }

    done();
  });

  it('should avoid prototype pollution', function(done) {
    var obj = { a: 1 };
    expect(obj.a).toEqual(1);
    expect(obj.__proto__).not.toBeUndefined();
    expect(obj.constructor).not.toBeUndefined();
    expect(obj.__defineGetter__).not.toBeUndefined();
    expect(obj.__defineSetter__).not.toBeUndefined();
    expect(obj.__lookupGetter__).not.toBeUndefined();
    expect(obj.__lookupSetter__).not.toBeUndefined();

    expect(getDeep(obj, ['a'])).toEqual(1);
    expect(getDeep(obj, ['__proto__'])).toBeUndefined();
    expect(getDeep(obj, ['__defineGetter__'])).toBeUndefined();
    expect(getDeep(obj, ['__defineSetter__'])).toBeUndefined();
    expect(getDeep(obj, ['__lookupGetter__'])).toBeUndefined();
    expect(getDeep(obj, ['__lookupGetter__'])).toBeUndefined();
    done();
  });
});
