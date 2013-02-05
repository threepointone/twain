var Twain = require('../twain'),
    Tween = Twain.Tween,
    util = Twain.util,
    __should = require('should');

describe('util', function() {

    describe('each', function() {

        it('should cycle through an array', function() {
            var str = '',
                arr = [1, 2, 3];

            util.each(arr, function(el, i) {
                str += el;
            });

            str.should.eql('123');
        });

        it('should cycle through an object', function() {
            var str = '',
                obj = {
                    a: 1,
                    b: 2,
                    c: 3
                };

            util.each(obj, function(el, key) {
                str += el;
            });

            str.should.eql('123');
        });

    });

    describe('isValue', function() {

        it('should return false for null and undefined', function() {
            util.isValue(null).should.eql(false);
            util.isValue(undefined).should.eql(false);
        });

        it('should return true for everything else', function() {
            util.isValue({}).should.eql(true);
            util.isValue([]).should.eql(true);
            util.isValue(123).should.eql(true);
            util.isValue('abc').should.eql(true);
            util.isValue('').should.eql(true);
            util.isValue(0).should.eql(true);
            util.isValue(-1).should.eql(true);
        });
    });

    describe('extend', function() {
        it('should copy properties onto the first argument', function() {
            var o = {};
            util.extend(o, {
                a: 1
            }, {
                b: 2
            });
            (o.a).should.eql(1);
            (o.b).should.eql(2);
        });
    });

    describe('collect', function() {
        it('should cycle through the object, and return an object based on the callback', function() {
            var sample = function(x) {
                    return {
                        gabba: x,
                        fn: function() {
                            return x;
                        }
                    };
                };
            var obj = {
                a: sample('a'),
                b: sample('b'),
                c: sample('c')
            };

            (util.collect(obj, function(o){
                return o.fn();
            })).should.eql({a:'a', b:'b', c:'c'});

            (util.collect(obj, 'gabba')).should.eql({a:'a', b:'b', c:'c'});

        });


    });
});

describe('Tween', function() {
    describe('defaults', function() {

    });

    describe('from', function() {

    });

    describe('to', function() {

    });

    describe('step', function() {

    });

    describe('update', function() {

    });

    describe('reset', function() {

    });

    describe('inertial', function() {

    });

});

describe('Twain', function() {
    describe('$t', function() {

    });

    describe('from', function() {

    });

    describe('to', function() {

    });

    describe('step', function() {

    });

    describe('update', function() {

    });

    describe('inertial', function() {

    });
});