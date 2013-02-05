var Twain = process.env.TWAIN_COV? require('../lib-cov/twain') : require('../lib/twain'),
    Tween = Twain.Tween,
    util = Twain.util,
    should = require('should');


var time = 0;
var ticker = function() {
        return time;
    };
ticker.tick = function() {
    time++;
};
ticker.reset = function() {
    time = 0;
};

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
            var str = '', pre= '',
                obj = {
                    a: 1,
                    b: 2,
                    c: 3
                };

            util.each(obj, function(el, key) {
                pre+=key;
                str += el;
            });
            pre.should.equal('abc');
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

            (util.collect(obj, function(o) {
                return o.fn();
            })).should.eql({
                a: 'a',
                b: 'b',
                c: 'c'
            });

            (util.collect(obj, 'gabba')).should.eql({
                a: 'a',
                b: 'b',
                c: 'c'
            });

        });
    });
});

describe('Tween', function() {
    describe('defaults', function() {
        it('should initialize neatly', function() {
            var o = Tween();
            util.each(['threshold', 'multiplier', 'acceleration', 'maxDisplacement', 'now'], function(param, i) {
                should.exist(o[param]);
            });
        });

    });

    describe('step', function() {
        it('should take a step', function() {
            ticker.reset();
            var t = Tween({
                now: ticker,
                multiplier: 0.15
            });


            t.from(0).to(1);
            t.update(function() {
                ticker.tick();
            });
            // first tick and update to get the basics set
            t.update();

            // next tick should start the tweening
            t.update();
            (t.value === 0.15).should.be.ok;

            // one more time to be sure
            t.update();

            (Math.abs(t.value - 0.2775) < 0.001).should.be.ok;
            ticker.reset();

        });



    });
    describe('reset', function() {

    });

    describe('inertial', function() {

    });

});

describe('Twain', function() {
    describe('$t', function() {
        it('should create tweener for every prop, and step through it', function() {


            var t = Twain({
                now: ticker
            });

            t.tweens.x = Tween({
                now: ticker
            }).from(10).to(123)


            t.from({
                y: 20
            }).to({
                y: 456
            });

            t.update(function() {
                ticker.tick();
            });

            t.$t('x')._from.should.eql(10);
            t.$t('x')._to.should.eql(123);

            t.$t('y')._from.should.eql(20);
            t.$t('y')._to.should.eql(456);

            // first tick to set everything down
            t.update();

            // next tick starts showing diffs
            t.update();

            (t.value.x > 10).should.be.ok;
            (t.value.y > 20).should.be.ok;

            ticker.reset();

        });


    });

    describe('inertial', function() {

    });
});