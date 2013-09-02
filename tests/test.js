var Twain = require('../index'),
    _ = require('fn'),
    Tween = Twain.Tween,
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

describe('Tween', function() {
    describe('defaults', function() {
        it('should initialize neatly', function() {
            var o = Tween();
            _.each(['threshold', 'multiplier', 'now'], function(param, i) {
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

        it('should set accept a function to multiply with', function(){
            var t = Twain({
                now: ticker(),
                multiplier: 0.15
            }).from({x:0, y:{z:0}}).to({x:100, y:{z:100}});


            t.update(function() {
                t.now.tick();
            });

            t.multiply(function(){
                return 0.001;
            });

            t.tweens.x.multiplier.should.eql(0.001);
            t.tweens.y.tweens.z.multiplier.should.eql(0.001);

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