var Twain = process.env.TWAIN_COV ? require('../lib-cov/twain') : require('../lib/twain'),
    Tween = Twain.Tween,
    util = Twain.util,
    should = require('should');


function ticker() {
    var time = 0;

    function f() {
        return time;
    }

    f.tick = function() {
        time++;
    };

    return f;
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
            var str = '',
                pre = '',
                obj = {
                    a: 1,
                    b: 2,
                    c: 3
                };

            util.each(obj, function(el, key) {
                pre += key;
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
            util.each(['threshold', 'multiplier', 'now'], function(param, i) {
                should.exist(o[param]);
            });
        });

    });

    it('should allow for nesting twains', function(){
        var timer = ticker();
        var t = Twain({now:timer}).from({
            x:{
                y:{
                    z:10
                }
            }
        }).update(function(){ timer.tick(); });

        t.to({
            x:{
                y:{
                    z:20
                }
            }
        });

        t.update().update().update().update();
        (t.tweens.x.tweens.y.tweens.z.value > 10).should.be.ok;
        (t.tweens.x.tweens.y.tweens.z.value < 20).should.be.ok;

    });

    describe('step', function() {
        it('should take a step', function() {

            var t = Tween({
                now: ticker(),
                multiplier: 0.15
            }).from(0).to(1);


            t.update(function() {
                t.now.tick();
            });

            // first tick and update to get the basics set
            t.update();

            // next tick should start the tweening
            t.update();
            (t.value === 0.15).should.be.ok;

            // one more time to be sure
            t.update();
            (Math.abs(t.value - 0.2775) < 0.001).should.be.ok;

        });



    });

    describe('multiply', function(){
        it('should set multiplier');
        it('should set multiplier as result of a function');
    });

    describe('stop', function() {
        it('should allow a tween to be paused and restarted');
    });

});

describe('Twain', function() {
    describe('$t', function() {
        it('should create tweener for every prop, and step through it', function() {

            var timer = ticker();

            var t = Twain({
                now: timer
            });

            t.tweens.x = Tween({
                now: timer
            }).from(10).to(123)


            t.from({
                y: 20
            }).to({
                y: 456
            });

            t.update(function() {
                timer.tick();
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


        });
    });

    describe('multiply', function(){
        it('should set multiplier across all subtweens', function(){
            var t = Twain({
                now: ticker(),
                multiplier: 0.15
            }).from({x:0, y:{z:0}}).to({x:100, y:{z:100}});


            t.update(function() {
                t.now.tick();
            });

            t.multiply(0.01);
            t.tweens.x.multiplier.should.eql(0.01);
            t.tweens.y.tweens.z.multiplier.should.eql(0.01);

        });
    });

    describe('stop', function() {
        it('should allow a twain to be paused and restarted');
    });

    describe('encode/decode', function(){
        it('should allow for random input to encoded into a a twain hash');
        it('should allow for step value to decoded into a custom format');
    });
});